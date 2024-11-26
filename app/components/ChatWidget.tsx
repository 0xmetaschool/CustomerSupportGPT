'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Check, Bot } from 'lucide-react';
import { encrypt } from '@/lib/encryption';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface ChatWidgetProps {
  botId: string;
  botName?: string;
  clientSecret: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  status?: 'sent' | 'seen';
}

/**
 * @dev ChatMessage component for displaying individual chat messages.
 * @param message - The message object.
 * @param isStreaming - Whether the message is currently streaming.
 * @returns A React component that renders the chat message.
 */
const ChatMessage = React.memo(({ message, isStreaming }: { 
  message: Message;
  isStreaming?: boolean;
}) => {
  const isAssistant = message.role === 'assistant';

  // Custom components for ReactMarkdown with proper typing
  const components: Components = {
    p: ({ children }) => (
      <p className="text-sm leading-relaxed mb-2">{children}</p>
    ),
    strong: ({ children }) => (
      <span className="font-semibold">{children}</span>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ml-4 mb-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-4 mb-2">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-1">{children}</li>
    ),
  };

  return (
    <div className={`w-full py-2 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`
          max-w-[70%] flex items-start px-4 py-3 rounded-xl relative
          ${isAssistant ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}
          ${isStreaming ? 'animate-pulse' : ''}
          ${isAssistant ? 'shadow-sm' : 'shadow-md'}
        `}
      >
        {isAssistant && (
          <div className="absolute -left-10 top-1">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown components={components}>
            {message.content}
          </ReactMarkdown>
        </div>
        {!isAssistant && message.status && (
          <div className="absolute -bottom-5 right-1 text-xs text-gray-500 flex items-center">
            {message.status === 'sent' ? (
              <Check className="w-3 h-3" />
            ) : (
              <div className="flex">
                <Check className="w-3 h-3" />
                <Check className="w-3 h-3 -ml-1" />
              </div>
            )}
            <span className="ml-1 text-[10px] uppercase tracking-wider">{message.status}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// Add display name for the memoized component
ChatMessage.displayName = 'ChatMessage';

/**
 * @dev TypingIndicator component for displaying a typing indicator.
 * @returns A React component that renders the typing indicator.
 */
const TypingIndicator = () => (
  <div className="w-full py-2 flex justify-start">
    <div className="rounded-xl px-4 py-3.5 flex items-center">
      <div className="flex space-x-1.5">
        <div className="w-1 h-1 bg-black rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-black rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-black rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

/**
 * @dev ChatWidget component for handling the chat interface with a specific bot.
 * @param botId - The ID of the bot.
 * @param botName - The name of the bot.
 * @param clientSecret - The client secret for authentication.
 * @returns A React component that renders the chat widget.
 */
export default function ChatWidget({ botId, botName = 'Assistant', clientSecret }: ChatWidgetProps) {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [seen, setSeen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [encryptedSecret, setEncryptedSecret] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'online'>('connecting');

  // Encrypt the client secret when the component mounts.
  useEffect(() => {
    if (clientSecret) {
      try {
        const encrypted = encrypt(clientSecret);
        setEncryptedSecret(encrypted);
      } catch (error) {
        console.error('Error encrypting client secret:', error);
      }
    }
  }, [clientSecret]);

  // Function to filter out content within 【】brackets
  const filterBracketedContent = (text: string): string => {
    return text.replace(/【[^】]*】/g, '');
  };

  useEffect(() => {
    if (conversation.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isTyping]);

  // Simulate a connection delay and show the welcome message.
  useEffect(() => {
    // Random connection time between 0.5-1 seconds
    const connectionTime = Math.floor(Math.random() * 500) + 500; // 500-1000ms
    
    const connectionTimer = setTimeout(() => {
      setConnectionStatus('online');
      
      // Add typing indicator
      setIsTyping(true);
      
      // After a delay, show the welcome message
      const messageTimer = setTimeout(() => {
        setIsTyping(false);
        setConversation([{ 
          role: 'assistant', 
          content: `Hi! I am ${botName}, how can I help you?` 
        }]);
      }, 1000); // Reduced from 1500ms

      return () => clearTimeout(messageTimer);
    }, connectionTime); // Random connection delay

    return () => clearTimeout(connectionTimer);
  }, [botName]);

  /**
   * @dev Handles the form submission for sending a message.
   * @param e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !encryptedSecret) {
      console.error('Missing input or encrypted secret');
      return;
    }

    try {
      // Reset states
      setSeen(false);
      setIsTyping(false);
      
      // Add user message with 'sent' status
      setConversation(prev => [...prev, { role: 'user', content: input, status: 'sent' }]);
      const currentInput = input;
      setInput('');
      setIsLoading(true);

      // Start both the API call and the UI animations immediately
      const encodedInput = encodeURIComponent(currentInput);
      const eventSourcePromise = new Promise<EventSource>((resolve) => {
        // Get last 10 messages for context
        const lastMessages = conversation.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const url = new URL(`${window.location.origin}/api/chat`);
        url.searchParams.append('message', encodedInput);
        url.searchParams.append('botId', botId);
        url.searchParams.append('widget', 'true');
        url.searchParams.append('clientSecret', encryptedSecret);
        url.searchParams.append('history', encodeURIComponent(JSON.stringify(lastMessages)));
        if (sessionId) {
          url.searchParams.append('sessionId', sessionId);
        }
        
        const es = new EventSource(url.toString());
        resolve(es);
      });

      // Handle UI animations in parallel with API call
      const uiAnimationPromise = (async () => {
        const randomDelay = Math.floor(Math.random() * 1000) + 500; // Reduced from 2000+1000 to 1000+500
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        setConversation(prev => 
          prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, status: 'seen' } : msg
          )
        );
        setSeen(true);
      })();

      const [eventSource] = await Promise.all([
        eventSourcePromise,
        uiAnimationPromise
      ]);

      // Show typing indicator after seen
      setIsTyping(true);

      let isFirstMessage = true;
      let assistantMessage = ''; // Store the message as we receive it

      eventSource.onmessage = (event) => {
        try {
          setIsLoading(false);
          const data = JSON.parse(event.data);
          
          if (data.sessionId) {
            setSessionId(data.sessionId);
            return;
          }

          if (data.content === "[DONE]") {
            eventSource.close();
            setIsStreaming(false);
            setIsTyping(false);
          } else {
            if (isFirstMessage) {
              // Add an empty assistant message that we'll update
              setConversation(prev => [...prev, { role: 'assistant', content: '' }]);
              setIsStreaming(true);
              isFirstMessage = false;
            }
            // Update the last message with accumulated content
            const filteredContent = filterBracketedContent(data.content?.trim() || '');
            if (filteredContent) {  // Only add content if there's something after filtering
              assistantMessage += (assistantMessage ? ' ' : '') + filteredContent;
              setConversation(prev => {
                const newConv = [...prev];
                if (newConv.length > 0) {
                  newConv[newConv.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                }
                return newConv;
              });
            }
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsStreaming(false);
        setIsTyping(false);
        setSeen(false);
        alert("Connection Error: Failed to connect to the server. Please try again.");
      };

    } catch (error) {
      console.error('Error getting advice:', error);
      setIsStreaming(false);
      setIsTyping(false);
      setSeen(false);
      alert("Error: An error occurred while getting advice. Please try again.");
    }
  };

  // Remove the useEffect for typing animation since we're handling it in the event stream
  useEffect(() => {
    if (seen) {
      setIsTyping(true);
    }
  }, [seen]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    connectionStatus === 'connecting' 
                      ? 'bg-orange-400' 
                      : 'bg-green-500'
                  }`} 
                />
                <div>
                    <h1 className="font-medium text-gray-900">
                      {connectionStatus === 'connecting' ? 'Agent' : botName}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {connectionStatus === 'connecting' ? 'Connecting to agent...' : 'Online'}
                    </p>
                </div>
              </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-stretch w-full space-y-2">
          {conversation.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isStreaming={isStreaming && index === conversation.length - 1}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex">
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type a message..."
            className="flex-1 mr-3 px-4 py-3 text-sm text-black rounded-xl border border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            disabled={isLoading || isStreaming}
          />
          <button
            type="submit"
            className="text-white bg-black px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            disabled={isLoading || isStreaming || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
          </form>
        </div>
    </div>
  );
}