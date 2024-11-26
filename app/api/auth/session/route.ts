import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @dev Handles the GET request to fetch the authenticated user's details.
 * @returns A JSON response containing the user details if the session is valid, otherwise an error response.
 */
export async function GET() {
  // Retrieve the authentication token from the cookies.
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');

  // If no token is found, return an error indicating no session.
  if (!token) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }

  try {
    // Verify the token to extract the user ID.
    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Connect to the database and fetch the user by their ID, excluding the password field.
    const db = await getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from the result
    );

    // If no user is found, return an error indicating the user was not found.
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Return the user details and the token in the response.
    return NextResponse.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        token: token.value
      }
    });
  } catch (error) {
    // Log any errors that occur during the session verification process and return a generic invalid session error.
    console.error('Session verification error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}