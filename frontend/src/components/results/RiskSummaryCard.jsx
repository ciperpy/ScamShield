import React, { useState } from 'react';
import { RiskBadge } from '../StatusBadge';
import { ShieldAlert, Info, HelpCircle, X, CheckCircle2 } from 'lucide-react';

export default function RiskSummaryCard({ result }) {
  const [showScoreModal, setShowScoreModal] = useState(false);

  const {
    target,
    risk_level,
    risk_score,
    summary,
    risk_details,
    created_at
  } = result;

  const isUnknown = risk_level === 'UNKNOWN / INCONCLUSIVE' || risk_level?.includes('UNKNOWN');
  const formattedDate = created_at ? new Date(created_at).toLocaleString() : 'Just now';
  const confidence = risk_details?.confidence || 'MEDIUM';

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 sm:p-8 shadow-saas-card space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-saas-border pb-5">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-saas-subtle uppercase tracking-wider font-mono">
            <span>SECURITY ANALYSIS</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-saas-text tracking-tight font-mono break-all">
            {target}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <RiskBadge level={risk_level} />

            <div className="flex items-center space-x-1.5 text-xs text-saas-muted bg-saas-secondary px-3 py-1 rounded-md border border-saas-border">
              <span>Risk Score:</span>
              <strong className="text-saas-text font-mono font-bold">{risk_score} / 100</strong>
              {risk_details?.score_breakdown?.length > 0 && (
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="ml-1 text-saas-blue hover:underline text-[11px] font-medium flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Breakdown</span>
                </button>
              )}
            </div>

            <div className="text-xs text-saas-muted bg-saas-secondary px-3 py-1 rounded-md border border-saas-border">
              Confidence: <strong className="text-saas-text">{confidence}</strong>
            </div>
          </div>
        </div>
      </div>

      {isUnknown ? (
        <div className="bg-saas-secondary border border-saas-border p-4 rounded-xl space-y-1 text-xs">
          <h4 className="font-bold text-saas-text">UNKNOWN / INCONCLUSIVE</h4>
          <p className="text-saas-muted leading-relaxed">
            Not enough independent evidence was available to determine whether this URL is safe. Absence of evidence does not prove safety.
          </p>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-saas-muted leading-relaxed font-sans">
          {summary}
        </p>
      )}

      {/* Score Calculation Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-saas-surface border border-saas-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-saas-border pb-3">
              <h3 className="text-base font-bold text-saas-text">How was this score calculated?</h3>
              <button
                onClick={() => setShowScoreModal(false)}
                className="text-saas-subtle hover:text-saas-text p-1 rounded-lg hover:bg-saas-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-saas-border/60 text-saas-subtle">
                <span>Base Baseline Score</span>
                <span>0</span>
              </div>

              {risk_details?.score_breakdown?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-saas-text border-b border-saas-border/40">
                  <span className="truncate max-w-[280px]">{item.title}</span>
                  <span className="font-bold text-saas-danger">+{item.points}</span>
                </div>
              ))}

              <div className="flex justify-between pt-2 text-sm font-bold text-saas-text">
                <span>Calculated Risk Score</span>
                <span>{risk_score} / 100</span>
              </div>
            </div>

            <p className="text-[11px] text-saas-subtle italic">
              Weights are computed by ScamShield's evidence engine based on threat intelligence severity tiers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
