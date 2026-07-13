import { NextResponse } from 'next/server';
import { logDarajaApi } from '@/lib/daraja-logger';
import { adminDb } from '@/lib/firebase-admin'; // 🚨 ADDED: Import your Firestore admin db

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🚨 Make sure your frontend is passing the userId along with phoneNumber and moduleId!
    const { phoneNumber, moduleId, userId } = body; 

    // 1. Format the phone number (Safaricom requires 254XXXXXXXXX)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return NextResponse.json({ error: 'M-Pesa credentials missing' }, { status: 500 });
    }

    // 2. Generate Safaricom OAuth Token
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${authString}` },
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to generate M-Pesa access token');
    }

    // 3. Generate Password & Timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // 4. Determine your live callback URL
    const callbackUrl = `https://${req.headers.get('host')}/api/mpesa/callback`;

    // 5. Prepare the STK Push Payload
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 100, // Hardcoded Ksh 100
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `Module_${moduleId}`,
      TransactionDesc: `Unlock Module ${moduleId}`,
    };

    // Log the outbound request
    await logDarajaApi('/mpesa/stkpush/v1/processrequest', 'OUTBOUND', payload, 'PENDING');

    // 6. Initiate STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const stkData = await stkResponse.json();

    // Log Safaricom's immediate response
    await logDarajaApi('/mpesa/stkpush/v1/processrequest', 'INBOUND', stkData, stkResponse.status);

    // ==========================================
    // 🚨 THE QUICK INITIATOR UPDATE IS HERE 🚨
    // ==========================================
    if (stkData.ResponseCode === '0') {
      
      // Before we tell the frontend "Success", we create the PENDING record in Firestore
      // using Safaricom's CheckoutRequestID as the document ID.
      await adminDb.collection('transactions').doc(stkData.CheckoutRequestID).set({
        userId: userId || 'UNKNOWN_USER', 
        moduleId: moduleId || 'UNKNOWN_MODULE',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'STK Push sent successfully', 
        checkoutRequestID: stkData.CheckoutRequestID 
      });

    } else {
      return NextResponse.json({ error: stkData.errorMessage || 'Failed to initiate STK push' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('STK Push Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}