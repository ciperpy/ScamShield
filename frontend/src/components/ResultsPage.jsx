import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getScanDetails, scanUrl } from '../services/api';
import ResultsPanel from './ResultsPanel';
import { 
  ArrowLeft, Shield, ShieldCheck, Loader2, ShieldAlert, 
  RefreshCw, Clock, ExternalLink 
} from 'lucide-react';

export default function ResultsPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');
  const [deepScanning, setDeepScanning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // If state was provided and scan_id matches, use it
    if (location.state?.result && location.state.result.scan_id === scanId) {
      setResult(location.state.result);
      setLoading(false);
      return;
    }

    // Otherwise fetch scan report from backend API by scan_id
    let isMounted = true;
    setLoading(true);
    setError('');

    getScanDetails(scanId)
      .then((data) => {
        if (isMounted) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.detail || 
            'Scan report not found. It may have expired or backend service is offline.'
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [scanId]);

  const handleDeepUrlScan = async (extractedUrl) => {
    try {
      setDeepScanning(true);
      const res = await scanUrl(extractedUrl);
      navigate(`/results/url/${res.scan_id}`, { state: { result: res } });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to analyze embedded URL.');
    } finally {
      setDeepScanning(false);
    }
  };

  const formattedDate = result?.created_at
    ? new Date(result.created_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Dedicated Header Bar */}
      <div className="bg-saas-surface border border-saas-border rounded-2xl p-4 sm:p-6 shadow-saas-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 bg-saas-secondary hover:bg-saas-blue-light text-saas-text hover:text-saas-blue border border-saas-border px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-saas-muted group-hover:text-saas-blue transition-colors" />
            <span>← Back to Scanner</span>
          </button>

          {/* Right: Scan Telemetry Meta */}
          {result && (
            <div className="flex items-center space-x-3 text-xs text-saas-subtle font-mono">
              <span className="bg-saas-bg border border-saas-border px-2.5 py-1 rounded-lg">
                ID: {scanId.substring(0, 8)}...
              </span>
              {formattedDate && (
                <span className="hidden sm:inline-flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Header Title Banner */}
        <div className="flex items-start justify-between border-t border-saas-border pt-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-saas-blue-light text-saas-blue border border-saas-blue/20 text-[11px] font-bold font-mono px-2 py-0.5 rounded uppercase">
                {result?.input_type === 'message' ? 'Message Analysis Report' : 'URL Investigation Report'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-saas-text tracking-tight">
              Security Investigation Results
            </h1>
          </div>

          <button
            onClick={() => {
              if (result?.input_type === 'message') {
                navigate('/scan/message');
              } else {
                navigate('/scan/url');
              }
            }}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-saas-blue hover:text-saas-blue-hover font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-saas-surface border border-saas-border rounded-2xl p-12 text-center space-y-4 shadow-saas-sm">
          <Loader2 className="w-10 h-10 text-saas-blue animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-saas-text">Retrieving Security Analysis Report</h3>
            <p className="text-xs text-saas-subtle font-mono">Scan ID: {scanId}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-saas-surface border border-saas-danger/30 rounded-2xl p-8 text-center space-y-6 shadow-saas-sm">
          <div className="p-3 bg-saas-danger-bg border border-saas-danger/20 text-saas-danger rounded-2xl w-fit mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-saas-text">Scan Report Unavailable</h3>
            <p className="text-xs text-saas-muted leading-relaxed">{error}</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-saas-blue hover:bg-saas-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-saas-sm inline-flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Scanner</span>
          </button>
        </div>
      )}

      {/* Deep Scanning Loader for Embedded URLs */}
      {deepScanning && (
        <div className="fixed inset-0 bg-saas-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-saas-surface border border-saas-border rounded-2xl p-6 max-w-sm w-full text-center space-y-3 shadow-saas-card">
            <Loader2 className="w-8 h-8 text-saas-blue animate-spin mx-auto" />
            <p className="text-sm font-bold text-saas-text">Running Deep URL Scan...</p>
            <p className="text-xs text-saas-subtle">Evaluating domain telemetry and threat intelligence.</p>
          </div>
        </div>
      )}

      {/* Results Dashboard Panel */}
      {result && !loading && (
        <ResultsPanel
          result={result}
          onScanExtractedUrl={handleDeepUrlScan}
        />
      )}
    </div>
  );
}
