import * as jose from 'jose';

/**
 * @dev Verifies the JWT token and extracts the user ID.
 * @param token - The JWT token to verify.
 * @returns The user ID if the token is valid, otherwise null.
 */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    // Encode the JWT secret using TextEncoder.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // Verify the token using the secret.
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Return the user ID from the token payload.
    return payload.userId as string;
  } catch (error) {
    // Log any errors that occur during token verification.
    console.error('Token verification error:', error);
    return null;
  }
}