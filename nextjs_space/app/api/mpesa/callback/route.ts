import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { logDarajaApi } from '@/lib/daraja-logger';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const checkoutRequestID = data?.Body?.stkCallback?.CheckoutRequestID || 'UNKNOWN_REF';

    // 1. SECURE THE EVIDENCE
    await logDarajaApi('/api/mpesa/callback', 'INBOUND', data, 200, checkoutRequestID);

    const stkCallback = data?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid payload received' }, { status: 400 });
    }

    // 2. REFERENCE THE PENDING TRANSACTION
    // We use the CheckoutRequestID to find the record we created when the prompt was sent
    const transactionRef = adminDb.collection('transactions').doc(checkoutRequestID);
    const txDoc = await transactionRef.get();

    if (stkCallback.ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const receipt = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phone = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      console.log(`✅ Success! Received Ksh ${amount} from ${phone}. Receipt: ${receipt}`);

      // 3. UPDATE TRANSACTION STATUS
      // Instead of .set() (which overwrites), we use .update() to keep the userId and moduleId
      await transactionRef.update({
        amount,
        phone,
        receipt,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        rawPayload: stkCallback
      });

      // 4. THE MAGIC: UNLOCK THE MODULE FOR THE USER
      if (txDoc.exists) {
        const { userId, moduleId } = txDoc.data() as any;
        
        if (userId && moduleId) {
           // Create a record in the user's profile showing they own this module
           await adminDb.collection('users').doc(userId).collection('unlockedModules').doc(moduleId).set({
              unlockedAt: new Date().toISOString(),
              receipt: receipt,
              method: 'MPESA'
           });
           console.log(`🔓 Successfully unlocked ${moduleId} for user ${userId}!`);
        }
      }

    } else {
      console.log(`❌ Payment Failed or Cancelled: ${stkCallback.ResultDesc}`);
      // Mark the pending transaction as failed
      await transactionRef.update({
         status: 'FAILED',
         errorReason: stkCallback.ResultDesc,
         updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}