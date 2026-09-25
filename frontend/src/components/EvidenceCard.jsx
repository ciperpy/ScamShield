import React from 'react';
import { ExternalLink, ShieldAlert, AlertTriangle, Info, CheckCircle, AlertOctagon } from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: {
    border: 'border-saas-danger/30',
    bg: 'bg-saas-danger-bg',
    badge: 'bg-saas-danger text-white border-saas-danger',
    icon: AlertOctagon,
    iconColor: 'text-saas-danger'
  },
  HIGH: {
    border: 'border-saas-danger/30',
    bg: 'bg-saas-danger-bg',
    badge: 'bg-saas-danger text-white border-saas-danger',
    icon: ShieldAlert,
    iconColor: 'text-saas-danger'
  },
  MEDIUM: {
    border: 'border-saas-warning/30',
    bg: 'bg-saas-warning-bg',
    badge: 'bg-saas-warning text-white border-saas-warning',
    icon: AlertTriangle,
    iconColor: 'text-saas-warning'
  },
  LOW: {
    border: 'border-saas-blue/20',
    bg: 'bg-saas-blue-light',
    badge: 'bg-saas-blue text-white border-saas-blue',
    icon: Info,
    iconColor: 'text-saas-blue'
  },
  INFO: {
    border: 'border-saas-border',
    bg: 'bg-saas-surface',
    badge: 'bg-saas-secondary text-saas-muted border-saas-border',
    icon: CheckCircle,
    iconColor: 'text-saas-success'
  }
};

export default function EvidenceCard({ item }) {
  const config = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.INFO;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
          <div>
            <h4 className="text-sm font-semibold text-saas-text leading-tight">{item.title}</h4>
            <span className="text-[11px] text-saas-subtle font-mono">Source: {item.source}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${config.badge}`}>
            {item.severity}
          </span>
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-saas-blue hover:text-saas-blue-hover flex items-center gap-1 bg-saas-surface px-2 py-0.5 rounded border border-saas-border transition-colors font-medium"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <p className="text-xs text-saas-muted leading-relaxed pl-6">
        {item.description}
      </p>

      {item.interpretation && (
        <div className="ml-6 pl-3 border-l-2 border-saas-border text-[11px] text-saas-subtle italic">
          <strong className="text-saas-muted not-italic font-medium">Security Context: </strong>
          {item.interpretation}
        </div>
      )}
    </div>
  );
}
