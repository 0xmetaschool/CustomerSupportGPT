'use client';

import { useEffect, useState } from 'react';
import ChatWidget from '@/app/components/ChatWidget';
import { useSearchParams } from 'next/navigation';

// Interface for the Bot object.
interface Bot {
  _id: string;
  name: string;
  description: string;
  assistantId: string;
}

/**
 * @dev Widget component for embedding the chat widget on a website.
 * @param params - The route parameters, containing the bot ID.
 * @returns A React component that renders the chat widget.
 */
export default function Widget({ params }: { params: { id: string } }) {
  const [bot, setBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');

  // Fetch the bot data when the component mounts.
  useEffect(() => {
    const fetchBot = async () => {
      try {
        const response = await fetch(`/api/widget/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bot');
        }
        const data = await response.json();
        setBot(data.bot);
      } catch (error) {
        setError(`Error loading chat widget, ${error}`);
      }
    };

    fetchBot();
  }, [params.id]);

  // Error state UI.
  if (error) return <div className="text-red-500">{error}</div>;
  // Loading state UI.
  if (!bot) return <div>Loading...</div>;
  // Error state UI if the client secret is missing.
  if (!clientSecret) return <div>Error: Missing client secret</div>;

  return (
    <div className="h-full">
      {/* Global styles to ensure the widget takes up the full height of the body */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
      {/* Render the ChatWidget component with the bot ID, name, and client secret */}
      <ChatWidget botId={bot._id} botName={bot.name} clientSecret={clientSecret} />
    </div>
  );
}