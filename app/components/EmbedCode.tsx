'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Code, X } from 'lucide-react';

interface EmbedCodeProps {
  botId: string;
}

/**
 * @dev EmbedCode component for generating and displaying the embed code for the chat widget.
 * @param botId - The ID of the bot.
 * @returns A React component that renders the embed code modal.
 */
export function EmbedCode({ botId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @dev Fetches the client secret from the API.
   */
  useEffect(() => {
    const generateClientSecret = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bots/${botId}/secret`, {
          credentials: 'include'
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error generating client secret:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      generateClientSecret();
    }
  }, [botId, isOpen]);

  /**
   * @dev Handles the escape key to close the modal.
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Generate the embed code with the bot ID and client secret.
  const embedCode = `<!-- AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.defer = true;
    script.setAttribute('data-bot-id', '${botId}');
    script.setAttribute('data-client-secret', '${clientSecret || ''}');
    script.setAttribute('data-base-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`;

  /**
   * @dev Copies the embed code to the clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Button to open the modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-gray-500" />
          <span className="text-gray-500">Embed Code</span>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal position helper */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Code className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Embed Code
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add this code to your website to enable the chat widget
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Add to your website&apos;s HTML</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="max-h-[360px] overflow-y-auto rounded-lg bg-white p-4 text-sm text-gray-800 shadow-sm">
                        {embedCode}
                      </pre>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 text-right">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}