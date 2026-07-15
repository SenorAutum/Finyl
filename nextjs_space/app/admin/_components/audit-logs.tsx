'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🚨 NEW: Import Firebase tools
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    // 🚨 NEW: Query the Firestore transactions collection (limit to 50)
    const q = query(collection(db, 'transactions'), limit(50));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Determine status based on M-Pesa's ResultCode (0 is success)
        const isSuccess = data.Body?.stkCallback?.ResultCode === 0 || data.ResponseCode === "0";
        
        // Try to find the M-Pesa receipt number
        let receiptRef = 'N/A';
        if (data.Body?.stkCallback?.CallbackMetadata?.Item) {
          const receiptItem = data.Body.stkCallback.CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber');
          if (receiptItem) receiptRef = receiptItem.Value;
        } else if (data.CheckoutRequestID) {
          receiptRef = data.CheckoutRequestID;
        }

        // Map it to your exact UI structure
        return {
          id: doc.id,
          direction: 'INBOUND',
          endpoint: '/api/mpesa/callback',
          statusCode: isSuccess ? 200 : (data.Body?.stkCallback?.ResultCode || 'PENDING'),
          timestamp: data.createdAt || new Date().toISOString(),
          transactionRef: receiptRef,
          payload: JSON.stringify(data, null, 2)
        };
      });

      // Sort newest first
      txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(txs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm">
        <Activity className="h-6 w-6 animate-pulse text-teal-500" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col h-64 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400">
        <Terminal className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No API logs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-slate-500" />
          Daraja API Audit Trail
        </h2>
        <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Sync Active
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="flex flex-col">
            {/* Clickable Row */}
            <div 
              onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Direction Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  log.direction === 'OUTBOUND' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {log.direction === 'OUTBOUND' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {log.endpoint}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      log.statusCode === 200 || log.statusCode === '0' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : log.statusCode === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {log.statusCode === 200 ? 'SUCCESS' : log.statusCode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex gap-3">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="font-mono">Ref: {log.transactionRef}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable JSON Viewer */}
            <AnimatePresence>
              {expandedLogId === log.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-900 border-t border-slate-800"
                >
                  <div className="p-6 overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-bold tracking-wider uppercase">
                      <Terminal className="h-4 w-4" /> Raw JSON Payload
                    </div>
                    <pre className="text-xs font-mono text-emerald-400">
                      {log.payload}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}