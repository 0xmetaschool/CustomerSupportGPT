'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Bot, Upload, FileText, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Interface for the Version object.
interface Version {
  version: number;
  fileName: string;
  fileId: string;
  uploadedAt: string;
}

// Interface for the Bot object.
interface Bot {
  _id: string;
  name: string;
  description: string;
  versions: Version[];
  currentVersion: number;
  assistantId?: string;
}

/**
 * @dev ManageBot component for managing a specific bot.
 * @param params - The route parameters, containing the bot ID.
 * @returns A React component that renders the bot management interface.
 */
export default function ManageBot({ params }: { params: { id: string } }) {
  // State variables for the bot, file, loading state, uploading state, and error message.
  const { user } = useAuth();
  const router = useRouter();
  const [bot, setBot] = useState<Bot | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @dev Fetches the bot data from the API.
   */
  const fetchBot = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bots/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBot(data.bot);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch bot');
      }
    } catch (error) {
      setError(`An error occurred while fetching the bot: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the bot data when the component mounts or when the user changes.
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      fetchBot();
    }
  }, [user]);

  /**
   * @dev Handles the file change event for the file input.
   * @param e - The change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  /**
   * @dev Handles the form submission for uploading a document.
   * @param e - The form event.
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/bots/${params.id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setFile(null);
        fetchBot();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload document');
      }
    } catch (error) {
      setError(`An error occurred while uploading the document: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  // Loading state UI.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error state UI when the bot is not found.
  if (!bot) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Bot Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The requested bot could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)]">
        {/* Error message display */}
        {error && (
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back to Dashboard button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="space-y-6">
            {/* Bot Info Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Bot className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{bot.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{bot.description}</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-6 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-sm text-gray-500">Current Version</p>
                  <p className="mt-1 font-medium text-gray-900">v{bot.currentVersion || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assistant Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {bot.assistantId ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`text-sm font-medium ${bot.assistantId ? 'text-green-600' : 'text-yellow-600'}`}>
                      {bot.assistantId ? 'Active' : 'Not Created'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Upload className="h-5 w-5" />
                Upload Document
              </h2>
              
              <form onSubmit={handleUpload} className="mt-4">
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Versions Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5" />
                Document Versions
              </h2>
              
              {bot.versions && bot.versions.length > 0 ? (
                <div className="mt-4 divide-y divide-gray-100">
                  {bot.versions.map((version) => (
                    <div key={version.version} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-gray-900">Version {version.version}</p>
                        <p className="mt-1 text-sm text-gray-500">{version.fileName}</p>
                      </div>
                      <p className="text-sm text-gray-500 text-right">
                        {new Date(version.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}