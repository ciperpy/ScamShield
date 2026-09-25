import React from 'react';
import RiskSummaryCard from './results/RiskSummaryCard';
import DetectionOverview from './results/DetectionOverview';
import SecurityProvidersCard from './results/SecurityProvidersCard';
import DomainIntelligenceCard from './results/DomainIntelligenceCard';
import RedirectTimeline from './results/RedirectTimeline';
import UrlStructureCard from './results/UrlStructureCard';
import BrandImpersonationCard from './results/BrandImpersonationCard';
import ExecutionTimeline from './results/ExecutionTimeline';
import LimitationsCard from './results/LimitationsCard';
import EvidenceCard from './EvidenceCard';
import { 
  ShieldCheck, ShieldAlert, ArrowRight, CornerDownRight, 
  CheckCircle, HelpCircle, AlertTriangle 
} from 'lucide-react';

export default function ResultsPanel({ result, onScanExtractedUrl }) {
  if (!result) return null;

  const {
    input_type,
    evidence = [],
    why_this_result = [],
    recommendations = [],
    technical_details = {},
    url_structure_checks = [],
    execution_timeline = [],
    limitations = []
  } = result;

  const redirects = technical_details.redirects;
  const brandData = technical_details.brand;
  const extractedUrls = technical_details.extracted_urls || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION A — Top Result Summary Card */}
      <RiskSummaryCard result={result} />

      {/* SECTION B — Detection Overview Bar */}
      {input_type === 'url' && <DetectionOverview result={result} />}

      {/* Extracted URL Quick-Scan Action (Message Scanner) */}
      {input_type === 'message' && extractedUrls.length > 0 && (
        <div className="bg-saas-blue-light border border-saas-blue/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-saas-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-saas-blue text-white rounded-lg">
              <CornerDownRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-saas-text">Embedded URL Detected in Message</h4>
              <p className="text-xs text-saas-muted font-mono break-all">{extractedUrls[0]}</p>
            </div>
          </div>

          <button
            onClick={() => onScanExtractedUrl(extractedUrls[0])}
            className="bg-saas-blue hover:bg-saas-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center space-x-1.5 shadow-saas-sm"
          >
            <span>Run Deep URL Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION C — Why ScamShield Reached This Result */}
      <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 space-y-3 shadow-saas-sm">
        <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-saas-blue" />
          <span>WHY THIS RESULT?</span>
        </h3>

        <ul className="space-y-2 text-xs text-saas-muted">
          {why_this_result.map((point, idx) => (
            <li key={idx} className="flex items-start space-x-2 bg-saas-bg p-3 rounded-xl border border-saas-border">
              <div className="w-1.5 h-1.5 rounded-full bg-saas-blue mt-1.5 shrink-0" />
              <span className="font-sans text-saas-text">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SECTION D — Security Provider Results (VirusTotal & urlscan.io) */}
      {input_type === 'url' && <SecurityProvidersCard result={result} />}

      {/* SECTION E — URL & Domain Intelligence */}
      {input_type === 'url' && <DomainIntelligenceCard result={result} />}

      {/* SECTION F — Redirect Chain Timeline */}
      {input_type === 'url' && <RedirectTimeline redirects={redirects} />}

      {/* SECTION G — URL Structure Analysis */}
      {input_type === 'url' && <UrlStructureCard checks={url_structure_checks} />}

      {/* SECTION H — Brand Impersonation Analysis */}
      {input_type === 'url' && <BrandImpersonationCard brandData={brandData} />}

      {/* Comprehensive Evidence Panel */}
      <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 space-y-4 shadow-saas-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-saas-warning" />
            <span>DETAILED EVIDENCE FACTORS</span>
          </h3>
          <span className="text-xs text-saas-subtle font-mono">{evidence.length} evidence items</span>
        </div>

        {evidence.length === 0 ? (
          <p className="text-xs text-saas-subtle italic">No specific evidence factors were generated.</p>
        ) : (
          <div className="space-y-3">
            {evidence.map((item, idx) => (
              <EvidenceCard key={idx} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION J — Execution Timeline */}
      <ExecutionTimeline steps={execution_timeline} />

      {/* SECTION K — Recommended Safety Action */}
      <div className="bg-saas-warning-bg border border-saas-warning/30 rounded-2xl p-6 space-y-3 shadow-saas-sm">
        <h3 className="text-sm font-bold text-saas-warning flex items-center space-x-2 uppercase tracking-wider font-mono">
          <AlertTriangle className="w-4 h-4" />
          <span>RECOMMENDED ACTION</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-saas-surface p-3.5 rounded-xl border border-saas-warning/30 text-xs text-saas-text flex items-start space-x-2 font-medium">
              <CheckCircle className="w-4 h-4 text-saas-success shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION L — Analysis Limitations */}
      <LimitationsCard limitations={limitations} />
    </div>
  );
}
