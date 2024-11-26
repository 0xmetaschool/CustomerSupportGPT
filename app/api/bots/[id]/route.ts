import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
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

    // Return the bot details in the response.
    return NextResponse.json({ bot });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error fetching bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @dev Handles the PUT request to update a specific bot by its ID.
 * @param request - The incoming HTTP request.
 * @param params - The route parameters, containing the bot ID.
 * @returns A JSON response indicating success if the bot is updated, otherwise an error response.
 */
export async function PUT(
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

    // Parse the request body to extract the updated bot details.
    const body = await request.json();
    const { name, description } = body;

    // Connect to the database and update the bot by its ID and the user ID.
    const db = await getDatabase();
    const result = await db.collection('bots').updateOne(
      { 
        _id: new ObjectId(params.id),
        userId: new ObjectId(userId)
      },
      {
        $set: {
          name,
          description,
          updatedAt: new Date()
        }
      }
    );

    // If no bot is found, return a not found error.
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Return a success message indicating the bot was updated.
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error updating bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @dev Handles the DELETE request to delete a specific bot by its ID.
 * @param request - The incoming HTTP request.
 * @param params - The route parameters, containing the bot ID.
 * @returns A JSON response indicating success if the bot is deleted, otherwise an error response.
 */
export async function DELETE(
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

    // Connect to the database and delete the bot by its ID and the user ID.
    const db = await getDatabase();
    const result = await db.collection('bots').deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });

    // If no bot is found, return a not found error.
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Return a success message indicating the bot was deleted.
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during the process and return an internal server error.
    console.error('Error deleting bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}