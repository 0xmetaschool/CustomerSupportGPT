import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import crypto from 'crypto';
import { decrypt } from '@/lib/encryption';

// Type definition for Server-Sent Events (SSE) data
type SSEData = 
  | { sessionId: string }
  | { content: string }
  | { error: string };

// Define the message type interface
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Initialize the OpenAI client with the API key from environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @dev Handles the GET request to interact with the bot using Server-Sent Events (SSE).
 * @param request - The incoming HTTP request.
 * @returns A Response object containing the SSE stream with bot responses.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const botId = searchParams.get('botId');
  const message = searchParams.get('message');
  const encryptedClientSecret = searchParams.get('clientSecret');
  const sessionId = searchParams.get('sessionId');
  const isWidget = searchParams.get('widget') === 'true';
  const history = searchParams.get('history');

  // Validate required parameters
  if (!botId || !message) {
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ai_chat_app');

    // Fetch the bot data from the database
    const bot = await db.collection('bots').findOne({
      _id: new ObjectId(botId)
    });

    // If the bot is not found, return a 404 error
    if (!bot) {
      return new Response('Bot not found', { status: 404 });
    }

    // Verify the client secret if it's a widget request
    if (isWidget) {
      if (!encryptedClientSecret) {
        return new Response('Unauthorized: Missing client secret', { status: 401 });
      }

      try {
        const decryptedSecret = decrypt(encryptedClientSecret);
        if (decryptedSecret !== bot.clientSecret) {
          return new Response('Unauthorized: Invalid client secret', { status: 401 });
        }
      } catch (error) {
        console.error('Error decrypting client secret:', error);
        return new Response('Unauthorized: Invalid encryption', { status: 401 });
      }
    }

    // Fetch or create a session
    let session = null;
    if (sessionId) {
      session = await db.collection('sessions').findOne({
        sessionId,
        botId: new ObjectId(botId)
      });
    }

    // If no session exists, create a new one
    if (!session) {
      session = {
        botId: new ObjectId(botId),
        sessionId: crypto.randomBytes(16).toString('hex'),
        threadId: (await openai.beta.threads.create()).id,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      await db.collection('sessions').insertOne(session);
    }

    // Update the last activity timestamp for the session
    await db.collection('sessions').updateOne(
      { _id: session._id },
      { $set: { lastActivity: new Date() } }
    );

    // Use the session's thread ID for the conversation
    if (history) {
      try {
        const parsedHistory = JSON.parse(decodeURIComponent(history)) as ChatMessage[];
        // Only send the last 5 messages to reduce context loading time
        const recentHistory = parsedHistory.slice(-5);
        
        // Add messages in parallel instead of sequentially
        await Promise.all(recentHistory.map((msg: ChatMessage) => 
          openai.beta.threads.messages.create(session.threadId, {
            role: msg.role,
            content: msg.content,
          })
        ));
      } catch (error) {
        console.error('Error parsing conversation history:', error);
      }
    }

    await openai.beta.threads.messages.create(session.threadId, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(session.threadId, {
      assistant_id: bot.assistantId,
      instructions: `You are a friendly and empathetic customer service representative. 
      Your responses should be:
      1. Clear and concise while maintaining a human, conversational tone
      2. Empathetic and understanding of the customer's needs
      3. focus on current questions, don't poke about previous questions
      4. Keep your responses short within 20-30 words and to the point. Only go beyond it if needed
      5. Based on the available information without explicitly mentioning or referring to any documents
      6. Don't talk about any uploaded documents

      Remember to:
      - Never mention that you're an AI or that you're using any documents
      - Keep responses concise and summarized
      - Show understanding of customer concerns, ask follow-up questions
      - Use a friendly, helpful tone
      - If you don't find the answer in the document, say "Let me forward the query to my senior executive to assist you". Don't say anything else about not finding it in the doc or file uploaded
      - Stay focused on solving the customer's query
      - Maintain a natural conversation flow`
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send the session ID first if it's a new session
        if (!sessionId) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: session.sessionId })}\n\n`));
        }

        const sendSSE = (data: SSEData) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let pollingCount = 0;
        const maxPolls = 100; // Add a maximum number of polling attempts

        while (pollingCount < maxPolls) {
          const runStatus = await openai.beta.threads.runs.retrieve(session.threadId, run.id);
          
          if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(session.threadId, {
              limit: 1,
              order: 'desc'
            });
            const lastMessage = messages.data[0];

            if (lastMessage?.role === "assistant" && lastMessage.content?.[0]?.type === "text") {
              const text = lastMessage.content[0].text.value;
              // Send larger chunks (5 words) for faster display
              const words = text.split(' ');
              const chunkSize = 5;
              
              for (let i = 0; i < words.length; i += chunkSize) {
                const chunk = words.slice(i, i + chunkSize).join(' ');
                sendSSE({ content: chunk });
                // Minimal delay between chunks
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            }
            sendSSE({ content: '[DONE]' });
            controller.close();
            break;
          } else if (runStatus.status === 'failed') {
            sendSSE({ error: runStatus.last_error?.message || 'Run failed' });
            controller.close();
            break;
          }

          pollingCount++;
          // Reduced polling interval to 150ms
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        if (pollingCount >= maxPolls) {
          sendSSE({ error: 'Response timeout' });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}

// Ensure the route is dynamically rendered
export const dynamic = 'force-dynamic';