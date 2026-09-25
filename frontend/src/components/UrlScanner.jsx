import React, { useState } from 'react';
import { Link2, Search, Loader2, AlertCircle, Lock } from 'lucide-react';

const QUICK_TEST_URLS = [
  { label: 'Legitimate Site', url: 'https://paypal.com' },
  { label: 'IP Address', url: 'http://185.22.91.43/login' },
  { label: 'Suspicious Brand', url: 'https://paypal-security-login.example.xyz' }
];

export default function UrlScanner({ onScan, loading }) {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setError('Please enter a website URL to analyze.');
      return;
    }
    setError('');
    onScan(inputUrl.trim());
  };

  const handleChipClick = (url) => {
    setInputUrl(url);
    setError('');
    onScan(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-saas-text tracking-tight">Check a suspicious link</h2>
        <p className="text-xs sm:text-sm text-saas-subtle">Analyze the URL before visiting the website.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Large Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-4 text-saas-subtle pointer-events-none">
              <Link2 className="w-5 h-5 text-saas-subtle" />
            </div>
            
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/login"
              className="w-full h-14 bg-saas-surface border border-saas-border-dark focus:border-saas-blue focus:outline-none focus:ring-2 focus:ring-saas-blue/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-saas-text placeholder-saas-subtle transition-all font-sans"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-14 bg-saas-blue hover:bg-saas-blue-hover text-white font-semibold text-sm px-7 rounded-xl transition-all shadow-saas-sm flex items-center justify-center space-x-2 shrink-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze URL</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center text-xs text-saas-danger bg-saas-danger-bg border border-saas-danger/20 px-3.5 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-saas-subtle font-medium">Quick test:</span>
            {QUICK_TEST_URLS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip.url)}
                disabled={loading}
                className="text-xs bg-saas-bg hover:bg-saas-blue-light text-saas-muted hover:text-saas-blue border border-saas-border px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Privacy info note */}
          <div className="flex items-center space-x-1.5 text-xs text-saas-subtle">
            <Lock className="w-3.5 h-3.5 text-saas-subtle shrink-0" />
            <span>Security checks use available external intelligence providers when configured.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
