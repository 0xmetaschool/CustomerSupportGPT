import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * @dev Handles the POST request for user logout.
 * @returns A JSON response indicating successful logout.
 */
export async function POST() {
  // Delete the authentication cookie to log the user out.
  cookies().delete('auth_token');
  
  // Return a success message indicating the user has been logged out.
  return NextResponse.json({ message: 'Logged out successfully' });
}