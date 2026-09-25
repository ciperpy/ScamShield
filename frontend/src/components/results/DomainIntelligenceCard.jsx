import React from 'react';
import { Globe, Server, Database, Shield, Lock, Clock } from 'lucide-react';

export default function DomainIntelligenceCard({ result }) {
  const {
    target,
    technical_details = {},
    http_telemetry = {}
  } = result;

  const urlStruct = technical_details.url_structure || {};
  const domainData = technical_details.domain || {};
  const tls = technical_details.tls || {};
  const whoisInfo = domainData.whois || {};
  const dnsInfo = domainData.dns || {};

  const resolvedIps = dnsInfo.a_records?.length > 0 ? dnsInfo.a_records.join(', ') : 'Unknown';
  const mxRecords = dnsInfo.mx_records?.length > 0 ? dnsInfo.mx_records.slice(0, 2).join(', ') : 'None';
  const nsRecords = dnsInfo.ns_records?.length > 0 ? dnsInfo.ns_records.slice(0, 2).join(', ') : 'None';

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-4">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <Globe className="w-4 h-4 text-saas-blue" />
        <span>URL & DOMAIN INTELLIGENCE</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        {/* Network & Host Information */}
        <div className="bg-saas-bg p-4 rounded-xl border border-saas-border space-y-3">
          <h4 className="font-bold text-saas-text uppercase text-[11px] font-mono tracking-wider text-saas-subtle">
            Network & Address
          </h4>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">Submitted URL:</span>
              <span className="font-semibold text-saas-text truncate max-w-[200px]">{target}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">Hostname:</span>
              <span className="font-semibold text-saas-text">{urlStruct.hostname || 'Unknown'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">Resolved IP(s):</span>
              <span className="font-semibold text-saas-text truncate max-w-[200px]">{resolvedIps}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">MX Mail Records:</span>
              <span className="font-semibold text-saas-text truncate max-w-[200px]">{mxRecords}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-saas-subtle">Name Servers:</span>
              <span className="font-semibold text-saas-text truncate max-w-[200px]">{nsRecords}</span>
            </div>
          </div>
        </div>

        {/* Domain WHOIS & TLS */}
        <div className="bg-saas-bg p-4 rounded-xl border border-saas-border space-y-3">
          <h4 className="font-bold text-saas-text uppercase text-[11px] font-mono tracking-wider text-saas-subtle">
            Domain Age & Security Certificates
          </h4>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">WHOIS Domain Age:</span>
              <span className="font-semibold text-saas-text">
                {whoisInfo.domain_age_days !== null && whoisInfo.domain_age_days !== undefined
                  ? `${whoisInfo.domain_age_days} days`
                  : 'Unknown (Redacted)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">Domain Registrar:</span>
              <span className="font-semibold text-saas-text truncate max-w-[180px]">{whoisInfo.registrar || 'Unknown'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">HTTPS Encryption:</span>
              <span className={tls.has_https ? 'text-saas-success font-bold' : 'text-saas-danger font-bold'}>
                {tls.has_https ? 'Enabled' : 'Disabled (HTTP)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-saas-border/60">
              <span className="text-saas-subtle">TLS Certificate Issuer:</span>
              <span className="font-semibold text-saas-text truncate max-w-[180px]">{tls.issuer || 'Unknown / None'}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-saas-subtle">HTTP Response Status:</span>
              <span className="font-semibold text-saas-text">
                {http_telemetry?.status_code ? `HTTP ${http_telemetry.status_code}` : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
