'use client';

import Chat from '@/app/components/Chat';
import { useParams, useSearchParams } from 'next/navigation';

/**
 * @dev BotPlayground component for interacting with a specific bot.
 * @returns A React component that renders the chat interface for the bot.
 */
export default function BotPlayground() {
  // Extract the bot ID from the route parameters.
  const { id } = useParams();
  
  // Extract the bot name from the search parameters.
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  
  return (
    <>
      <div className="min-h-[calc(100vh-64px)]">
        {/* Render the Chat component with the bot ID and name */}
        <Chat botId={id as string} botName={name || ''} />
      </div>
    </>
  );
}