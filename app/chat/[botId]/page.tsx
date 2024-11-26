import React from 'react';
import Chat from '../../components/Chat';

interface ChatPageProps {
  params: {
    botId: string;
  };
}

/**
 * @dev ChatPage component for displaying the chat interface with a specific bot.
 * @param params - The route parameters, containing the bot ID.
 * @returns A React component that renders the chat interface.
 */
const ChatPage: React.FC<ChatPageProps> = async ({ params }) => {
  // Fetch the bot data from the API.
  const bot = await fetch(`/api/bots/${params.botId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const botData = await bot.json();
  const botName = botData.name;

  return (
    <div className="h-screen flex flex-col">
      {/* Header section */}
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Chat with Bot</h1>
      </header>
      {/* Main content section */}
      <main className="flex-1 overflow-hidden">
        {/* Render the Chat component with the bot ID and name */}
        <Chat botId={params.botId} botName={botName} />
      </main>
    </div>
  );
};

export default ChatPage;