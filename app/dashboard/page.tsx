'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { EmbedCode } from '../components/EmbedCode';
import { Bot, Settings, MessageSquare, Plus, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Interface for the Bot object.
interface BotType {
  _id: string;
  name: string;
  description: string | " ";
}

/**
 * @dev Dashboard component for displaying the user's bots and providing actions to manage them.
 * @returns A React component that renders the dashboard.
 */
const Dashboard = () => {
  const [bots, setBots] = useState<BotType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch the user's bots when the component mounts or when the user changes.
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchBots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bots', {
          credentials: 'include',
        });
        const data = await response.json();
        setBots(data.bots || []);
      } catch (error) {
        console.error('Error fetching bots:', error);
        setBots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [user, authLoading, router]);

  // Loading state UI.
  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Chatbots</h1>
              <p className="mt-2 text-sm text-gray-500">Manage and monitor your AI assistants</p>
            </div>
            <button 
              onClick={() => router.push('/create-bot')}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create New Bot
            </button>
          </div>

          {bots.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <div 
                  key={bot._id}
                  className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">{bot.name}</h2>
                      <Bot className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{bot.description}</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push(`/bot/${bot._id}/playground?name=${bot.name}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Open Playground
                    </button>

                    <button 
                      onClick={() => router.push(`/bot/${bot._id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      Manage Bot
                    </button>

                    <EmbedCode botId={bot._id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <Bot className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No bots created yet</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first AI assistant</p>
              <button 
                onClick={() => router.push('/create-bot')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Bot
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;