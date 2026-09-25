import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-saas-border bg-saas-surface sticky top-0 z-50 shadow-saas-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left Brand Area */}
        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-2 bg-saas-blue-light border border-saas-blue/20 rounded-xl text-saas-blue group-hover:bg-saas-blue group-hover:text-white transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-saas-text font-sans group-hover:text-saas-blue transition-colors">
                ScamShield
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-saas-secondary border border-saas-border text-saas-subtle font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-saas-subtle font-medium">Detect. Verify. Stay Safe.</p>
          </div>
        </Link>

        {/* Right Status Labels */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-saas-secondary border border-saas-border text-xs text-saas-muted font-medium">
            <span className="text-saas-blue font-bold">✓</span>
            <span>Evidence-Based</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-saas-secondary border border-saas-border text-xs text-saas-muted font-medium">
            <span className="text-saas-success font-bold">🔒</span>
            <span>Privacy First</span>
          </div>
        </div>
      </div>
    </header>
  );
}
