import { NextResponse } from 'next/server';
import { logDarajaApi } from '@/lib/daraja-logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, amount } = body; 

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const securityCredential = process.env.B2C_SECURITY_CREDENTIAL;
    
    if (!consumerKey || !consumerSecret || !securityCredential) {
      return NextResponse.json({ error: 'M-Pesa credentials missing' }, { status: 500 });
    }

    // 1. Generate OAuth Access Token
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${authString}` },
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to generate M-Pesa access token');
    }

    // 2. Prepare B2C Payload strictly matching the collection v1 structure
    const payload = {
      InitiatorName: process.env.B2C_INITIATOR_NAME || 'testapi', 
      SecurityCredential: securityCredential, 
      CommandID: "SalaryPayment",
      Amount: String(amount), 
      PartyA: String(process.env.MPESA_B2C_SHORTCODE || '600981'), 
      PartyB: String(phoneNumber),
      Remarks: "Finyl Affiliate Payout",
      QueueTimeOutURL: `https://${req.headers.get('host')}/api/mpesa/b2c/callback`,
      ResultURL: `https://${req.headers.get('host')}/api/mpesa/b2c/callback`,
      Occasion: "Payout"
    };

    // 3. Log the outbound structure
    await logDarajaApi('/mpesa/b2c/v1/paymentrequest', 'OUTBOUND', payload, 'PENDING');

    // 4. Send the Request using the correct v1 endpoint path
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // 5. Log internal inbound response data
    await logDarajaApi('/mpesa/b2c/v1/paymentrequest', 'INBOUND', data, response.status);

    return NextResponse.json(data);
  } catch (error) {
    console.error('B2C Route Error:', error);
    return NextResponse.json({ error: 'B2C Request Failed' }, { status: 500 });
  }
}