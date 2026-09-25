import React from 'react';
import { Eye, Globe, Shield, RefreshCw, Clock, Network } from 'lucide-react';

export default function DetectionOverview({ result }) {
  const {
    technical_details = {},
    http_telemetry = {}
  } = result;

  const vt = technical_details.virustotal || {};
  const domainData = technical_details.domain || {};
  const tls = technical_details.tls || {};
  const redirects = technical_details.redirects || {};
  const whoisInfo = domainData.whois || {};

  const vtDetections = vt.total_engines
    ? `${vt.malicious || 0} / ${vt.total_engines}`
    : 'Not checked';

  const dnsStatus = domainData.dns?.a_records?.length > 0 ? 'Resolved' : 'No Records';
  const tlsStatus = tls.has_https ? (tls.certificate_valid ? 'Valid' : 'Invalid') : 'No HTTPS';
  const httpStatus = http_telemetry?.status_code ? `HTTP ${http_telemetry.status_code}` : 'Not checked';
  const redirectHops = redirects.redirect_count !== undefined ? `${redirects.redirect_count}` : '0';
  const domainAge = whoisInfo.domain_age_days !== null && whoisInfo.domain_age_days !== undefined
    ? `${whoisInfo.domain_age_days} days`
    : 'Unknown';

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-4 sm:p-6 shadow-saas-sm space-y-3">
      <h3 className="text-xs font-bold text-saas-subtle uppercase tracking-wider font-mono">
        DETLECTION OVERVIEW STATISTICS
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        {/* VirusTotal */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">VirusTotal</span>
          <span className="text-saas-text font-mono font-bold block truncate">{vtDetections}</span>
        </div>

        {/* DNS */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">DNS Status</span>
          <span className="text-saas-text font-semibold block">{dnsStatus}</span>
        </div>

        {/* TLS */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">TLS Security</span>
          <span className="text-saas-text font-semibold block">{tlsStatus}</span>
        </div>

        {/* HTTP */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">HTTP Status</span>
          <span className="text-saas-text font-mono font-semibold block">{httpStatus}</span>
        </div>

        {/* Redirects */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">Redirect Hops</span>
          <span className="text-saas-text font-mono font-semibold block">{redirectHops}</span>
        </div>

        {/* Domain Age */}
        <div className="bg-saas-bg p-3 rounded-xl border border-saas-border space-y-1">
          <span className="text-[10px] text-saas-subtle uppercase font-medium block">Domain Age</span>
          <span className="text-saas-text font-semibold block">{domainAge}</span>
        </div>
      </div>
    </div>
  );
}
