'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity, Terminal, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
          Last 50 Events
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
                  <div className="p-6 overflow-x-auto">
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