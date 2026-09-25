import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Slash } from 'lucide-react';

export default function ExecutionTimeline({ steps = [] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-4">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <Clock className="w-4 h-4 text-saas-blue" />
        <span>ANALYSIS EXECUTION TIMELINE</span>
      </h3>

      <div className="bg-saas-bg p-4 rounded-xl border border-saas-border space-y-2.5 font-mono text-xs">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 border-b border-saas-border/40 last:border-0">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] text-saas-subtle">{step.timestamp}</span>
              <span className="font-sans font-medium text-saas-text">{step.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              {step.duration_ms !== null && step.duration_ms !== undefined && (
                <span className="text-[10px] text-saas-subtle">{step.duration_ms}ms</span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                step.status === 'COMPLETED'
                  ? 'bg-saas-success-bg text-saas-success border-saas-success/30'
                  : step.status === 'SKIPPED' || step.status === 'NOT_CONFIGURED'
                  ? 'bg-saas-secondary text-saas-subtle border-saas-border'
                  : 'bg-saas-danger-bg text-saas-danger border-saas-danger/30'
              }`}>
                {step.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
