import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Safaricom nests everything inside Body.stkCallback
    const stkCallback = data?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid payload received' }, { status: 400 });
    }

    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
      // ResultCode 0 means the payment was completely successful!
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      
      // Extract exactly what we need using Safaricom's specific key names
      const amountItem = callbackMetadata.find((item: any) => item.Name === 'Amount');
      const receiptItem = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber');
      const phoneItem = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber');

      const amount = amountItem?.Value;
      const receipt = receiptItem?.Value;
      const phone = phoneItem?.Value;

      console.log(`✅ Success! Received Ksh ${amount} from ${phone}. Receipt: ${receipt}`);
      
      // TODO: Save this receipt to Firestore and unlock the module for the user!

    } else {
      // Payment failed, timed out, or was cancelled by the user
      console.log(`❌ Payment Failed or Cancelled: ${stkCallback.ResultDesc}`);
    }

    // Safaricom ALWAYS requires a 200 OK response so they stop pinging your server
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}