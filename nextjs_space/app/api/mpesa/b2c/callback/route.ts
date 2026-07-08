import { NextResponse } from 'next/server';
import { logDarajaApi } from '@/lib/daraja-logger';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 1. SECURE THE EVIDENCE: Log the exact webhook payload from Safaricom
    await logDarajaApi('/api/mpesa/b2c/callback', 'INBOUND', data, 200, data?.Result?.TransactionID);

    if (data?.Result?.ResultCode === 0) {
      // Payment was successful! 
      // Add your Firestore logic here to mark the payout as "COMPLETED"
      console.log('✅ B2C Payout Successful');
    } else {
      console.log('❌ B2C Payout Failed:', data?.Result?.ResultDesc);
    }

    // Safaricom ALWAYS expects a 200 OK
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}