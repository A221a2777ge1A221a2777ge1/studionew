import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate strong random nonce
    const nonce = `Login nonce: ${Math.floor(Math.random() * 1e9)} at ${Date.now()}`;
    
    // Store with expiry (5 minutes)
    const nonceRef = doc(db, 'authNonces', uid);
    await setDoc(nonceRef, {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      createdAt: Date.now()
    });

    console.log('🔍 [NONCE API] Generated nonce for UID:', uid);

    return NextResponse.json({ 
      success: true, 
      nonce,
      expiresIn: 5 * 60 * 1000 // 5 minutes in milliseconds
    });

  } catch (error) {
    console.error('🔍 [NONCE API] Error generating nonce:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
