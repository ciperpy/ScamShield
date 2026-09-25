import React, { useState } from 'react';
import { Eye, ExternalLink, ChevronDown, ChevronUp, Slash, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SecurityProvidersCard({ result }) {
  const [showVtEngines, setShowVtEngines] = useState(false);

  const {
    technical_details = {},
    service_statuses = []
  } = result;

  const vtDetails = technical_details.virustotal || {};
  const urlscanDetails = technical_details.urlscan || {};

  const vtStatus = service_statuses.find(s => s.service.includes('VirusTotal')) || {};
  const urlscanStatus = service_statuses.find(s => s.service.includes('urlscan')) || {};

  const engineResults = vtDetails.engine_results || [];

  return (
    <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 shadow-saas-sm space-y-5">
      <h3 className="text-sm font-bold text-saas-text uppercase tracking-wider font-mono flex items-center space-x-2">
        <Eye className="w-4 h-4 text-saas-blue" />
        <span>SECURITY PROVIDER RESULTS</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VirusTotal Provider Box */}
        <div className="bg-saas-bg border border-saas-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-saas-text text-sm">VirusTotal v3</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-saas-surface border border-saas-border text-saas-subtle font-bold">
                {vtStatus.status || 'NOT CHECKED'}
              </span>
            </div>

            {vtDetails.report_url && (
              <a
                href={vtDetails.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-saas-blue hover:underline flex items-center space-x-1 font-medium"
              >
                <span>Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {vtStatus.status === 'COMPLETED' && vtDetails.total_engines ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-[10px] text-saas-subtle block">Detections</span>
                  <span className="font-bold text-saas-text">{vtDetails.malicious || 0} / {vtDetails.total_engines}</span>
                </div>
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-[10px] text-saas-subtle block">Malicious</span>
                  <span className="font-bold text-saas-danger">{vtDetails.malicious || 0}</span>
                </div>
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-[10px] text-saas-subtle block">Suspicious</span>
                  <span className="font-bold text-saas-warning">{vtDetails.suspicious || 0}</span>
                </div>
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-[10px] text-saas-subtle block">Undetected</span>
                  <span className="font-bold text-saas-success">{vtDetails.undetected || 0}</span>
                </div>
              </div>

              {engineResults.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowVtEngines(!showVtEngines)}
                    className="text-xs text-saas-blue font-semibold flex items-center space-x-1 hover:underline pt-1"
                  >
                    <span>{showVtEngines ? 'Hide Security Engine Table' : 'View Security Engine Table'}</span>
                    {showVtEngines ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showVtEngines && (
                    <div className="mt-3 bg-saas-surface border border-saas-border rounded-xl p-3 max-h-56 overflow-y-auto font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2 font-bold border-b border-saas-border pb-1.5 text-saas-subtle text-[11px]">
                        <span>Security Engine</span>
                        <span>Verdict</span>
                      </div>
                      <div className="divide-y divide-saas-border/40">
                        {engineResults.map((eng, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-2 py-1.5 items-center">
                            <span className="truncate text-saas-text font-sans">{eng.engine}</span>
                            <span className={eng.category === 'malicious' ? 'text-saas-danger font-bold' : eng.category === 'suspicious' ? 'text-saas-warning font-bold' : 'text-saas-success font-medium'}>
                              {eng.result_text || eng.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-saas-surface border border-saas-border rounded-xl text-xs text-saas-subtle italic">
              {vtStatus.message || 'VirusTotal API key is not configured in environment.'}
            </div>
          )}
        </div>

        {/* urlscan.io Provider Box */}
        <div className="bg-saas-bg border border-saas-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-saas-text text-sm">urlscan.io</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-saas-surface border border-saas-border text-saas-subtle font-bold">
                {urlscanStatus.status || 'NOT CHECKED'}
              </span>
            </div>

            {urlscanDetails.report_url && (
              <a
                href={urlscanDetails.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-saas-blue hover:underline flex items-center space-x-1 font-medium"
              >
                <span>Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {urlscanStatus.status === 'COMPLETED' && urlscanDetails.final_url ? (
            <div className="space-y-2.5 text-xs">
              <div className="bg-saas-surface p-3 rounded-xl border border-saas-border space-y-1">
                <span className="text-[10px] text-saas-subtle block font-mono">Final Destination</span>
                <span className="font-mono text-saas-text font-semibold break-all">{urlscanDetails.final_url}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-saas-subtle block">Title:</span>
                  <span className="font-sans font-semibold text-saas-text truncate block">{urlscanDetails.page_title}</span>
                </div>
                <div className="bg-saas-surface p-2 rounded-lg border border-saas-border">
                  <span className="text-saas-subtle block">Server / IP:</span>
                  <span className="font-semibold text-saas-text truncate block">{urlscanDetails.ip || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-saas-surface border border-saas-border rounded-xl text-xs text-saas-subtle italic">
              {urlscanStatus.message || 'urlscan.io API key is not configured in environment.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
