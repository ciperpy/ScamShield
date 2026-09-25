import React from 'react';
import { Cpu, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function UrlStructureCard({ checks = [] }) {
  if (!checks || checks.length === 0) return null;

  const getStatusBadge = (status) => {
    if (status === 'PASS') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-saas-success-bg text-saas-success border border-saas-success/30 uppercase flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>PASS</span>
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-saas-warning-bg text-saas-warning border border-saas-warning/30 uppercase flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>WARNING</span>
        </span>
      );
    }
    if (status === 'FAIL') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-saas-danger-bg text-saas-danger border border-saas-danger/30 uppercase flex items-center space-x-1">
          <XCircle className="w-3 h-3" />
          <span>FAIL</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-saas-secondary text-saas-subtle border border-saas-border uppercase flex items-center space-x-1">
        <HelpCircle className="w-3 h-3" />
        <span>UNKNOWN</span>
      </span>
    );
  };

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-4">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <Cpu className="w-4 h-4 text-saas-blue" />
        <span>URL STRUCTURE ANALYSIS</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {checks.map((c, idx) => (
          <div key={idx} className="bg-saas-bg p-3.5 rounded-xl border border-saas-border flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-semibold text-saas-text block">{c.name}</span>
              <p className="text-[11px] text-saas-muted leading-tight">{c.description}</p>
            </div>
            <div className="shrink-0">{getStatusBadge(c.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
