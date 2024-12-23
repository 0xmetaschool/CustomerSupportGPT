import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
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
    const body = await request.json();
    
    const response = await handleUpload({
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      body,
      onBeforeGenerateToken: async () => {
        // Optionally add custom logic before token generation
        return {};
      },
      onUploadCompleted: async () => {
        // Optionally add logic to run after upload completes
      },
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: 'Failed to handle blob upload' },
      { status: 500 }
    );
  }
}