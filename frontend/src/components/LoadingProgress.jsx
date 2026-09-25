import React from 'react';
import { Loader2, Check } from 'lucide-react';

export default function LoadingProgress({ target, type = 'url' }) {
  const steps = type === 'url' ? [
    { label: 'URL validation & syntax structure', status: 'done' },
    { label: 'Domain intelligence & WHOIS lookup', status: 'running' },
    { label: 'TLS certificate & HTTPS inspection', status: 'pending' },
    { label: 'Threat intelligence API queries', status: 'pending' },
    { label: 'Evidence aggregation & risk report', status: 'pending' }
  ] : [
    { label: 'Message syntax & normalization', status: 'done' },
    { label: 'Social engineering pattern recognition', status: 'running' },
    { label: 'Urgency & pressure tactic detection', status: 'pending' },
    { label: 'Credential request flags (OTP/PIN)', status: 'pending' },
    { label: 'Evidence aggregation & risk report', status: 'pending' }
  ];

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-card max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center space-x-3 border-b border-saas-border pb-4">
        <div className="p-2.5 bg-saas-blue-light border border-saas-blue/20 rounded-xl text-saas-blue">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-saas-text">Analyzing security...</h3>
          <p className="text-xs text-saas-subtle font-mono truncate max-w-xs">{target}</p>
        </div>
      </div>

      <div className="space-y-3 font-sans text-xs">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className={step.status === 'pending' ? 'text-saas-subtle' : 'text-saas-text font-medium'}>
              {step.label}
            </span>
            <div>
              {step.status === 'done' && (
                <span className="text-saas-success font-bold flex items-center justify-center w-5 h-5 rounded-full bg-saas-success-bg border border-saas-success/30 text-[11px]">
                  ✓
                </span>
              )}
              {step.status === 'running' && (
                <span className="text-saas-blue font-bold flex items-center justify-center w-5 h-5 rounded-full bg-saas-blue-light border border-saas-blue/30 text-[11px] animate-pulse">
                  ●
                </span>
              )}
              {step.status === 'pending' && (
                <span className="text-saas-subtle font-normal flex items-center justify-center w-5 h-5 text-[11px]">
                  ○
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
