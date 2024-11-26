import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @dev Handles the GET request to fetch a specific bot by its ID.
 * @param request - The incoming HTTP request.
 * @param params - The route parameters, containing the bot ID.
 * @returns A JSON response containing the bot details if the request is valid, otherwise an error response.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the MongoDB client.
    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    // Fetch the bot by its ID, projecting only the name, description, and assistantId fields.
    const bot = await db.collection('bots').findOne(
      { _id: new ObjectId(params.id) },
      { projection: { name: 1, description: 1, assistantId: 1 } }
    );

    // If no bot is found, return a not found error.
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Return the bot details in the response.
    return NextResponse.json({ bot });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error fetching bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}