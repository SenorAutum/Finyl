import { adminDb } from '@/lib/firebase-admin';

export async function logDarajaApi(
  endpoint: string, 
  direction: 'OUTBOUND' | 'INBOUND', 
  payload: any, 
  statusCode: number | string,
  transactionRef?: string
) {
  try {
    const logRef = adminDb.collection('api_audit_logs').doc();
    await logRef.set({
      timestamp: new Date().toISOString(),
      endpoint,
      direction, // Will be either 'OUTBOUND' (us talking to them) or 'INBOUND' (them talking to us)
      statusCode,
      transactionRef: transactionRef || 'N/A',
      payload: JSON.stringify(payload, null, 2)
    });
    console.log(`✅ [DARAJA LOG] ${direction} -> ${endpoint}`);
  } catch (error) {
    console.error('Failed to write Daraja Audit Log:', error);
  }
}