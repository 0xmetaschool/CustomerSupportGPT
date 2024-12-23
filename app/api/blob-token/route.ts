import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET(request: Request): Promise<NextResponse> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await verifyToken(token.value);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    return NextResponse.json({ token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error('Error getting blob token:', error);
    return NextResponse.json(
      { error: 'Failed to get blob token' },
      { status: 500 }
    );
  }
}
