import { NextResponse } from 'next/server';
import { logDarajaApi } from '@/lib/daraja-logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, amount } = body; // e.g., 254700000000

    // Note: You must generate a new Access Token here just like you do for C2B
    const accessToken = 'YOUR_GENERATED_TOKEN'; 

    const payload = {
      InitiatorName: process.env.B2C_INITIATOR_NAME, // From Daraja Portal
      SecurityCredential: process.env.B2C_SECURITY_CREDENTIAL, // From Daraja Portal
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: phoneNumber,
      Remarks: "Finyl Affiliate Payout",
      QueueTimeOutURL: `https://${req.headers.get('host')}/api/mpesa/b2c/callback`,
      ResultURL: `https://${req.headers.get('host')}/api/mpesa/b2c/callback`,
      Occasion: "Payout"
    };

    // 1. LOG THE OUTBOUND REQUEST
    await logDarajaApi('/mpesa/b2c/v3/paymentrequest', 'OUTBOUND', payload, 'PENDING');

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // 2. LOG SAFARICOM'S IMMEDIATE ACKNOWLEDGEMENT
    await logDarajaApi('/mpesa/b2c/v3/paymentrequest', 'INBOUND', data, response.status);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'B2C Request Failed' }, { status: 500 });
  }
}