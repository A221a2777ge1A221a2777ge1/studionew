import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { uid, address, signature } = await request.json();

    if (!uid || !address || !signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: uid, address, signature' },
        { status: 400 }
      );
    }

    console.log('🔍 [VERIFY WALLET API] Verifying wallet for UID:', uid, 'Address:', address);

    // Fetch expected nonce
    const nonceRef = doc(db, 'authNonces', uid);
    const nonceDoc = await getDoc(nonceRef);
    
    if (!nonceDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'No nonce found for this user' },
        { status: 400 }
      );
    }

    const { nonce, expiresAt } = nonceDoc.data();
    
    // Check if nonce has expired
    if (Date.now() > expiresAt) {
      // Clean up expired nonce
      await deleteDoc(nonceRef);
      return NextResponse.json(
        { success: false, message: 'Nonce has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify signature
    try {
      const recovered = ethers.verifyMessage(nonce, signature);
      
      if (recovered.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: 'Signature verification failed' },
          { status: 400 }
        );
      }

      console.log('🔍 [VERIFY WALLET API] Signature verified successfully');

      // Mark nonce as used (delete it)
      await deleteDoc(nonceRef);

      // Link wallet to user document
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        wallets: arrayUnion({
          address: address.toLowerCase(),
          linkedAt: serverTimestamp(),
          verified: true,
          chainId: '0x38', // BSC Mainnet
          label: 'Primary Wallet'
        }),
        lastWalletLink: serverTimestamp(),
        walletCount: 1 // This will be updated properly in a real implementation
      }, { merge: true });

      console.log('🔍 [VERIFY WALLET API] Wallet linked successfully to user:', uid);

      return NextResponse.json({ 
        success: true, 
        message: 'Wallet linked successfully',
        wallet: {
          address: address.toLowerCase(),
          linkedAt: new Date().toISOString()
        }
      });

    } catch (signatureError) {
      console.error('🔍 [VERIFY WALLET API] Signature verification error:', signatureError);
      return NextResponse.json(
        { success: false, message: 'Invalid signature format' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('🔍 [VERIFY WALLET API] Error verifying wallet:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
