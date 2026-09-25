import React from 'react';
import { Network, ArrowDown, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RedirectTimeline({ redirects }) {
  if (!redirects) return null;

  const redirectCount = redirects.redirect_count || 0;
  const chain = redirects.redirect_chain || [];
  const hopDetails = redirects.hop_details || [];

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
          <Network className="w-4 h-4 text-saas-warning" />
          <span>REDIRECT CHAIN TIMELINE</span>
        </h3>
        <span className="text-xs text-saas-subtle font-mono">{redirectCount} redirects detected</span>
      </div>

      {redirectCount > 0 ? (
        <div className="bg-saas-bg p-5 rounded-xl border border-saas-border space-y-3 font-mono text-xs">
          {chain.map((url, idx) => {
            const hopInfo = hopDetails[idx] || {};
            const statusCode = hopInfo.status_code || (idx < chain.length - 1 ? 301 : 200);

            return (
              <React.Fragment key={idx}>
                <div className="flex items-start space-x-3 bg-saas-surface p-3 rounded-lg border border-saas-border">
                  <div className="text-[10px] font-bold px-2 py-1 rounded bg-saas-secondary border border-saas-border text-saas-subtle shrink-0">
                    HTTP {statusCode}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="break-all font-semibold text-saas-text block">{url}</span>
                    <div className="text-[10px] text-saas-subtle flex items-center space-x-2 font-sans">
                      {idx === 0 && <span className="text-saas-blue font-bold">Initial Submitted URL</span>}
                      {idx === chain.length - 1 && <span className="text-saas-warning font-bold">Final Destination Page</span>}
                      {hopInfo.server && <span>Server: {hopInfo.server}</span>}
                    </div>
                  </div>
                </div>

                {idx < chain.length - 1 && (
                  <div className="flex justify-center text-saas-subtle py-0.5">
                    <ArrowDown className="w-4 h-4 text-saas-subtle animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="bg-saas-bg p-4 rounded-xl border border-saas-border text-xs text-saas-subtle">
          No redirects detected (Direct HTTP destination).
        </div>
      )}
    </div>
  );
}
