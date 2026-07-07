import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const stkCallback = data?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid payload received' }, { status: 400 });
    }

    if (stkCallback.ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const receipt = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phone = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      console.log(`✅ Success! Received Ksh ${amount} from ${phone}. Receipt: ${receipt}`);

      // UPGRADE: Using Admin SDK to force an instant, synchronous write to the cloud!
      const transactionRef = adminDb.collection('transactions').doc(receipt);
      await transactionRef.set({
        amount,
        phone,
        receipt,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        rawPayload: stkCallback
      });

    } else {
      console.log(`❌ Payment Failed or Cancelled: ${stkCallback.ResultDesc}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}