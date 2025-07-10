import { NextResponse } from 'next/server';
import { db } from '@/lib/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Verify the request is from Simplify
    const simplifyToken = req.headers.get('x-simplify-token');
    if (simplifyToken !== process.env.SIMPLIFY_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract application data
    const { userId, companyName, position } = data;

    if (!userId || !companyName || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update user's application count in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      applicationsSubmitted: increment(1),
      lastApplicationDate: new Date().toISOString(),
      lastApplicationCompany: companyName,
      lastApplicationPosition: position
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Simplify webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 