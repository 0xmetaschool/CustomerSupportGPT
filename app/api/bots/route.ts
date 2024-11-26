import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import OpenAI from "openai";

// Initialize the OpenAI client with the API key from environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @dev Handles the GET request to fetch all bots associated with the authenticated user.
 * @returns A JSON response containing the list of bots if the request is valid, otherwise an error response.
 */
export async function GET() {
  try {
    // Retrieve the authentication token from the cookies.
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    // If no token is found, return an unauthorized error.
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token to extract the user ID.
    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to the MongoDB client and fetch all bots associated with the user ID.
    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    const bots = await db.collection('bots').find({ userId: new ObjectId(userId) }).toArray();

    // Return the list of bots in the response.
    return NextResponse.json({ bots });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error fetching bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @dev Handles the POST request to create a new bot.
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the newly created bot's ID and assistant ID if the request is valid, otherwise an error response.
 */
export async function POST(request: Request) {
  try {
    // Retrieve the authentication token from the cookies.
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    // If no token is found, return an unauthorized error.
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token to extract the user ID.
    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse the request body to extract the bot's name and description.
    const { name, description } = await request.json();

    // Create an OpenAI Assistant with the provided name and instructions.
    const assistant = await openai.beta.assistants.create({
      name: name,
      instructions: "You are an expert customer service agent. Use your knowledge base to answer questions about product/service according to the docs uploaded. Don't talk about any uploaded documents, act like a human",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    // Connect to the MongoDB client and insert the new bot into the database.
    const client = await clientPromise;
    const db = client.db('ai_chat_app');

    const result = await db.collection('bots').insertOne({
      userId: new ObjectId(userId),
      name,
      description,
      assistantId: assistant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return the newly created bot's ID and assistant ID in the response.
    return NextResponse.json({ botId: result.insertedId, assistantId: assistant.id });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error creating bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}