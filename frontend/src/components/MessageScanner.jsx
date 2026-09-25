import React, { useState } from 'react';
import { Loader2, AlertCircle, Sparkles, Lock } from 'lucide-react';

const SAMPLE_MESSAGES = [
  {
    label: 'Urgent Bank Block',
    text: 'URGENT! Your bank account will be suspended within 2 hours due to unauthorized activity. Verify your PIN and details immediately: http://example.xyz/claim'
  },
  {
    label: 'Prize Claim',
    text: 'Congratulations! You have won ₹50,000 in the festive lucky draw. Claim your cashback reward instantly by verifying your details: http://reward-claim.top'
  },
  {
    label: 'Benign Message',
    text: 'Hi John, hoping you are doing well! Are we still meeting for lunch today at 1 PM?'
  }
];

export default function MessageScanner({ onScan, loading }) {
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please paste a suspicious message to analyze.');
      return;
    }
    setError('');
    onScan(messageText.trim());
  };

  const handleChipClick = (text) => {
    setMessageText(text);
    setError('');
    onScan(text);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-saas-text tracking-tight">Check a suspicious message</h2>
        <p className="text-xs sm:text-sm text-saas-subtle">
          Paste an SMS, email, or message to identify common scam and phishing indicators.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste the suspicious message here..."
              className="w-full bg-saas-surface border border-saas-border-dark focus:border-saas-blue focus:outline-none focus:ring-2 focus:ring-saas-blue/20 rounded-xl p-4 text-sm text-saas-text placeholder-saas-subtle transition-all font-sans"
              disabled={loading}
            />
            <div className="absolute right-3 bottom-3 text-xs font-mono text-saas-subtle bg-saas-secondary px-2 py-0.5 rounded border border-saas-border">
              {messageText.length} chars
            </div>
          </div>

          {error && (
            <div className="flex items-center text-xs text-saas-danger bg-saas-danger-bg border border-saas-danger/20 px-3.5 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Bottom Bar with Quick Samples & Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-saas-subtle font-medium">Quick sample:</span>
            {SAMPLE_MESSAGES.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip.text)}
                disabled={loading}
                className="text-xs bg-saas-bg hover:bg-saas-blue-light text-saas-muted hover:text-saas-blue border border-saas-border px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-saas-blue hover:bg-saas-blue-hover text-white font-semibold text-sm px-7 rounded-xl transition-all shadow-saas-sm flex items-center justify-center space-x-2 shrink-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Message...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy Info Notice */}
        <div className="flex items-center space-x-1.5 text-xs text-saas-subtle pt-1">
          <Lock className="w-3.5 h-3.5 text-saas-subtle shrink-0" />
          <span>Message content is analyzed without storing the complete message.</span>
        </div>
      </form>
    </div>
  );
}
