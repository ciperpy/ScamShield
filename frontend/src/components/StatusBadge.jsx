import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, CheckCircle, Clock, XCircle, Slash } from 'lucide-react';

export function RiskBadge({ level }) {
  let badgeStyle = 'bg-saas-secondary text-saas-muted border-saas-border';
  let dotColor = 'bg-saas-subtle';
  let Icon = HelpCircle;

  if (level === 'CRITICAL RISK' || level?.includes('CRITICAL')) {
    badgeStyle = 'bg-saas-danger-bg text-saas-critical border-saas-danger/30';
    dotColor = 'bg-saas-critical';
    Icon = ShieldAlert;
  } else if (level === 'HIGH RISK' || level?.includes('HIGH')) {
    badgeStyle = 'bg-saas-danger-bg text-saas-danger border-saas-danger/30';
    dotColor = 'bg-saas-danger';
    Icon = ShieldAlert;
  } else if (level === 'MEDIUM RISK' || level?.includes('MEDIUM')) {
    badgeStyle = 'bg-saas-warning-bg text-saas-warning border-saas-warning/30';
    dotColor = 'bg-saas-warning';
    Icon = AlertTriangle;
  } else if (level === 'SAFE / LOW RISK' || level?.includes('LOW') || level?.includes('SAFE')) {
    badgeStyle = 'bg-saas-success-bg text-saas-success border-saas-success/30';
    dotColor = 'bg-saas-success';
    Icon = ShieldCheck;
  } else {
    // UNKNOWN / INCONCLUSIVE
    badgeStyle = 'bg-saas-secondary text-saas-muted border-saas-border';
    dotColor = 'bg-saas-subtle';
    Icon = HelpCircle;
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold border ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{level || 'UNKNOWN / INCONCLUSIVE'}</span>
    </div>
  );
}

export function ApiStatusBadge({ service, status, message }) {
  let badgeStyle = 'bg-saas-surface text-saas-muted border-saas-border';
  let Icon = Slash;

  if (status === 'COMPLETED') {
    badgeStyle = 'bg-saas-success-bg text-saas-success border-saas-success/20';
    Icon = CheckCircle;
  } else if (status === 'NOT_CONFIGURED' || status === 'SKIPPED') {
    badgeStyle = 'bg-saas-secondary text-saas-subtle border-saas-border';
    Icon = Slash;
  } else if (status === 'RATE_LIMITED') {
    badgeStyle = 'bg-saas-warning-bg text-saas-warning border-saas-warning/20';
    Icon = Clock;
  } else if (status === 'SERVICE_UNAVAILABLE' || status === 'FAILED') {
    badgeStyle = 'bg-saas-danger-bg text-saas-danger border-saas-danger/20';
    Icon = XCircle;
  }

  return (
    <div className={`flex items-start justify-between p-3 rounded-xl border text-xs ${badgeStyle}`}>
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-saas-text">{service}</span>
          <span className="text-[11px] opacity-80">{message}</span>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-90 px-1.5 py-0.5 rounded bg-black/5">
        {status}
      </span>
    </div>
  );
}
