import { NextResponse } from 'next/server';

/**
 * @dev Handles the GET request to generate a JavaScript snippet for embedding the customer support widget.
 * @param req - The incoming HTTP request.
 * @returns A Response object containing the JavaScript snippet to embed the widget.
 */
export async function GET(req: Request) {
  // Parse the request URL to extract search parameters and origin.
  const { searchParams, origin } = new URL(req.url);
  const botId = searchParams.get('botId');

  // Validate that the bot ID is provided.
  if (!botId) {
    return new NextResponse('Bot ID is required', { status: 400 });
  }

  // Generate the JavaScript snippet to embed the widget.
  const script = `
    (function() {
      // Create widget container
      const container = document.createElement('div');
      container.id = 'customer-support-widget';
      document.body.appendChild(container);

      // Load React and Next.js runtime
      const script = document.createElement('script');
      script.src = '${origin}/widget/bundle.js';
      script.async = true;
      script.onload = function() {
        // Initialize widget with configuration
        window.CustomerSupportWidget.init({
          botId: '${botId}',
          primaryColor: '#000000',
          position: 'bottom-right',
        });
      };
      document.body.appendChild(script);

      // Load widget styles
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = '${origin}/widget/styles.css';
      document.head.appendChild(styles);
    })();
  `;

  // Return the JavaScript snippet in the response.
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}