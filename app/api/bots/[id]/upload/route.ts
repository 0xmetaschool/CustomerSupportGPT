import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
import fs from 'fs';
import os from 'os';
import path from 'path';
import { cookies } from 'next/headers';

const openai = new OpenAI();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    // Check if the bot exists and belongs to the user
    const bot = await db.collection('bots').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (!bot.assistantId) {
      return NextResponse.json({ error: 'Assistant not created for this bot' }, { status: 400 });
    }

    // Save the file temporarily
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFilePath, fileBuffer);

    // Create a vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: `${bot.name} - ${file.name}`,
    });

    // Upload the file to the vector store
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(
      vectorStore.id, 
      { files: [fs.createReadStream(tempFilePath)] }
    );

    // Update the assistant with the vector store
    await openai.beta.assistants.update(bot.assistantId, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    // Remove the temporary file
    fs.unlinkSync(tempFilePath);

    const newVersion = {
      version: (bot.currentVersion || 0) + 1,
      fileName: file.name,
      vectorStoreId: vectorStore.id,
      uploadedAt: new Date(),
    };

    // Update the bot with the new version
    const updateResult = await db.collection('bots').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $addToSet: { versions: newVersion },
        $set: { 
          currentVersion: newVersion.version,
          updatedAt: new Date(),
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to update bot with new version');
    }

    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      version: newVersion.version,
      vectorStoreId: vectorStore.id,
    });
  } catch (error) {
    console.error('Error uploading and processing document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
