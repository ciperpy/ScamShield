import React from 'react';
import { Info } from 'lucide-react';

export default function LimitationsCard({ limitations = [] }) {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="bg-saas-secondary border border-saas-border rounded-2xl p-6 space-y-3">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <Info className="w-4 h-4 text-saas-subtle" />
        <span>ANALYSIS LIMITATIONS</span>
      </h3>

      <ul className="space-y-1.5 text-xs text-saas-muted font-sans">
        {limitations.map((lim, idx) => (
          <li key={idx} className="flex items-start space-x-2">
            <span className="text-saas-subtle font-bold">•</span>
            <span>{lim}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
