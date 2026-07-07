import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const stkCallback = data?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid payload received' }, { status: 400 });
    }

    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
      // 1. Extract Safaricom Data
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const receipt = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phone = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      console.log(`✅ Success! Received Ksh ${amount} from ${phone}. Receipt: ${receipt}`);

      // 2. Identify the User and Module 
      // Safaricom doesn't know our User ID, but we can look up the user by their phone number!
      // *Note: For production, you will pass the User ID in the AccountReference during STK push*
      
      // For this implementation, we will log the transaction in a dedicated "transactions" collection
      const transactionRef = doc(db, 'transactions', receipt);
      await setDoc(transactionRef, {
        amount,
        phone,
        receipt,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        rawPayload: stkCallback
      });

      // TODO: In a full production app, you would query the 'users' collection to find the user 
      // with this phone number, and then run this update command:
      /*
      const userRef = doc(db, 'users', FOUND_USER_ID);
      await updateDoc(userRef, {
        unlockedModules: arrayUnion(TARGET_MODULE_ID)
      });
      */

    } else {
      console.log(`❌ Payment Failed or Cancelled: ${stkCallback.ResultDesc}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}