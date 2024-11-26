import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import * as jose from 'jose';

/**
 * @dev Handles the POST request for user login.
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the user details and token if login is successful, otherwise an error response.
 */
export async function POST(request: Request) {
  try {
    // Parse the request body to extract email and password.
    const body = await request.json();
    const { email, password } = body;

    // Validate that both email and password are provided.
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to the database and fetch the user by email.
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    // If no user is found, return an invalid credentials error.
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare the provided password with the hashed password stored in the database.
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a JWT token for the authenticated user.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Set the JWT token as an HTTP-only cookie for secure authentication.
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure the cookie is only sent over HTTPS in production.
      sameSite: 'lax', // Protect against CSRF attacks.
      maxAge: 60 * 60 * 24 * 7, // Set the cookie to expire in 1 week.
      path: '/', // Make the cookie available across the entire site.
    });

    // Return the user details and token in the response.
    return NextResponse.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        token
      }
    });
  } catch (error) {
    // Log any errors that occur during the login process and return a generic authentication error.
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}