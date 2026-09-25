import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UrlScanner from './UrlScanner';
import MessageScanner from './MessageScanner';
import LoadingProgress from './LoadingProgress';
import { scanUrl, scanMessage } from '../services/api';
import { 
  Link2, MessageSquare, ShieldCheck, Sparkles, 
  Eye, Lock, ShieldAlert, Cpu 
} from 'lucide-react';

export default function ScannerPage({ defaultTab = 'url' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setApiError('');
    navigate(`/scan/${tab}`);
  };

  const handleUrlScan = async (url) => {
    setLoading(true);
    setTargetInput(url);
    setApiError('');
    try {
      const res = await scanUrl(url);
      setLoading(false);
      navigate(`/results/url/${res.scan_id}`, { state: { result: res } });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to analyze URL. Backend server might be offline.');
      setLoading(false);
    }
  };

  const handleMessageScan = async (text) => {
    setLoading(true);
    setTargetInput(text);
    setApiError('');
    try {
      const res = await scanMessage(text);
      setLoading(false);
      navigate(`/results/message/${res.scan_id}`, { state: { result: res } });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to analyze message. Backend server might be offline.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 bg-saas-blue-light border border-saas-blue/20 text-saas-blue px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REAL-TIME SECURITY ANALYSIS</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-saas-text leading-tight">
            Is this link safe? <br />
            <span className="text-saas-blue">Check before you click.</span>
          </h1>
        </div>

        <p className="text-saas-subtle text-sm sm:text-base leading-relaxed max-w-[680px] mx-auto font-sans">
          Analyze suspicious URLs and scam messages using real security intelligence, domain telemetry, and transparent evidence.
        </p>

        {/* Soft Blue Circular Shield Visual */}
        <div className="pt-4 flex justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-saas-blue-light border border-saas-blue/20 flex items-center justify-center text-saas-blue shadow-saas-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SCANNER CONTAINER */}
      <section className="max-w-[900px] mx-auto">
        <div className="bg-saas-surface border border-saas-border rounded-[24px] p-6 sm:p-10 shadow-saas-card space-y-8">
          {/* Segmented Control Switcher */}
          <div className="flex justify-center">
            <div className="bg-saas-secondary p-1 rounded-xl inline-flex space-x-1 border border-saas-border w-full sm:w-auto">
              <button
                onClick={() => handleTabChange('url')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-saas-blue text-white shadow-saas-sm'
                    : 'text-saas-muted hover:text-saas-text'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>🔗 URL Scanner</span>
              </button>

              <button
                onClick={() => handleTabChange('message')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'message'
                    ? 'bg-saas-blue text-white shadow-saas-sm'
                    : 'text-saas-muted hover:text-saas-text'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>💬 Message Scanner</span>
              </button>
            </div>
          </div>

          {/* Loading Progress State */}
          {loading ? (
            <LoadingProgress target={targetInput} type={activeTab} />
          ) : (
            /* Scanner Form */
            activeTab === 'url' ? (
              <UrlScanner onScan={handleUrlScan} loading={loading} />
            ) : (
              <MessageScanner onScan={handleMessageScan} loading={loading} />
            )
          )}

          {apiError && (
            <div className="p-4 bg-saas-danger-bg border border-saas-danger/20 rounded-xl text-xs text-saas-danger flex items-center space-x-2.5 animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-saas-danger" />
              <span>{apiError}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. EDUCATIONAL SECTION: "Security analysis you can understand." */}
      <section className="max-w-5xl mx-auto space-y-10 pt-6 border-t border-saas-border">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-saas-text tracking-tight">
            Security analysis you can understand.
          </h2>
          <p className="text-xs sm:text-sm text-saas-muted leading-relaxed">
            ScamShield doesn't just give you a label. It shows the evidence behind the result.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-saas-surface border border-saas-border p-6 rounded-2xl space-y-3 shadow-saas-sm">
            <div className="p-2.5 bg-saas-blue-light border border-saas-blue/20 rounded-xl text-saas-blue w-fit">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-saas-text uppercase tracking-wider text-xs font-mono">REAL INTELLIGENCE</h3>
            <p className="text-xs text-saas-muted leading-relaxed">
              Use available threat intelligence sources and live domain telemetry where configured.
            </p>
          </div>

          <div className="bg-saas-surface border border-saas-border p-6 rounded-2xl space-y-3 shadow-saas-sm">
            <div className="p-2.5 bg-saas-blue-light border border-saas-blue/20 rounded-xl text-saas-blue w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-saas-text uppercase tracking-wider text-xs font-mono">TRANSPARENT EVIDENCE</h3>
            <p className="text-xs text-saas-muted leading-relaxed">
              Understand why a result was reached instead of receiving an unexplained guess.
            </p>
          </div>

          <div className="bg-saas-surface border border-saas-border p-6 rounded-2xl space-y-3 shadow-saas-sm">
            <div className="p-2.5 bg-saas-blue-light border border-saas-blue/20 rounded-xl text-saas-blue w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-saas-text uppercase tracking-wider text-xs font-mono">PRIVACY-FIRST ANALYSIS</h3>
            <p className="text-xs text-saas-muted leading-relaxed">
              Message content is processed locally and is not stored in full.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3-Step Section */}
      <section className="max-w-4xl mx-auto bg-saas-surface border border-saas-border p-8 sm:p-10 rounded-2xl space-y-8 shadow-saas-sm">
        <h2 className="text-xl font-bold text-saas-text text-center tracking-tight">
          Three steps to verify security
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <span className="text-4xl font-extrabold text-saas-blue font-mono">01</span>
            <h4 className="text-sm font-bold text-saas-text">Enter</h4>
            <p className="text-xs text-saas-muted">Paste a suspicious link or text message.</p>
          </div>

          <div className="space-y-3">
            <span className="text-4xl font-extrabold text-saas-blue font-mono">02</span>
            <h4 className="text-sm font-bold text-saas-text">Analyze</h4>
            <p className="text-xs text-saas-muted">ScamShield evaluates available security evidence.</p>
          </div>

          <div className="space-y-3">
            <span className="text-4xl font-extrabold text-saas-blue font-mono">03</span>
            <h4 className="text-sm font-bold text-saas-text">Understand</h4>
            <p className="text-xs text-saas-muted">Review the findings and recommended actions.</p>
          </div>
        </div>
      </section>

      {/* 5. TRUST SECTION */}
      <section className="max-w-3xl mx-auto bg-saas-blue-light border border-saas-blue/20 p-6 sm:p-8 rounded-2xl text-center space-y-3">
        <h3 className="text-base font-bold text-saas-text">Built for cautious clicks.</h3>
        <p className="text-xs text-saas-muted leading-relaxed max-w-xl mx-auto">
          ScamShield provides evidence-based security analysis to help you make informed decisions before interacting with suspicious content.
        </p>
        <p className="text-[11px] text-saas-subtle font-medium italic pt-1">
          No security scanner can guarantee detection of every unknown threat.
        </p>
      </section>
    </div>
  );
}
