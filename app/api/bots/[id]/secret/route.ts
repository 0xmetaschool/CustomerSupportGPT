import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

/**
 * @dev Handles the GET request to generate or retrieve the client secret for a specific bot.
 * @param request - The incoming HTTP request.
 * @param params - The route parameters, containing the bot ID.
 * @returns A JSON response containing the client secret if the request is valid, otherwise an error response.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Connect to the database and fetch the bot by its ID and the user ID.
    const db = await getDatabase();
    const bot = await db.collection('bots').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });

    // If no bot is found, return a not found error.
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Generate or retrieve the client secret for the bot.
    if (!bot.clientSecret) {
      const clientSecret = crypto.randomBytes(32).toString('hex');
      await db.collection('bots').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { clientSecret } }
      );
      return NextResponse.json({ clientSecret });
    }

    // Return the existing client secret.
    return NextResponse.json({ clientSecret: bot.clientSecret });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error generating client secret:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}