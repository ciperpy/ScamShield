import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function BrandImpersonationCard({ brandData }) {
  if (!brandData) return null;

  const impersonations = brandData.detected_impersonations || [];
  const rootDomain = brandData.root_domain || 'Unknown';

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-4">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-saas-warning" />
        <span>BRAND IMPERSONATION ANALYSIS</span>
      </h3>

      {impersonations.length > 0 ? (
        <div className="space-y-3">
          {impersonations.map((item, idx) => (
            <div key={idx} className="bg-saas-danger-bg border border-saas-danger/30 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-saas-danger text-sm">
                  ⚠️ Possible {item.brand} Impersonation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-saas-danger text-white font-bold uppercase">
                  Spoof Risk
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="bg-saas-surface p-2.5 rounded-lg border border-saas-border">
                  <span className="text-saas-subtle block font-sans">Actual Registered Root Domain:</span>
                  <span className="font-bold text-saas-text">{item.actual_root_domain}</span>
                </div>

                <div className="bg-saas-surface p-2.5 rounded-lg border border-saas-border">
                  <span className="text-saas-subtle block font-sans">Expected Official Brand Domains:</span>
                  <span className="font-bold text-saas-success">{item.legitimate_domains?.join(', ')}</span>
                </div>
              </div>

              <p className="text-[11px] text-saas-muted pt-1">
                The URL contains brand keyword '{item.brand}' in its path or subdomains, but the root domain '{item.actual_root_domain}' does not belong to {item.brand}.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-saas-success-bg border border-saas-success/20 p-4 rounded-xl text-xs text-saas-success flex items-center space-x-2 font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0 text-saas-success" />
          <span>✓ No known brand impersonation patterns or lookalike domain squatting detected.</span>
        </div>
      )}
    </div>
  );
}
