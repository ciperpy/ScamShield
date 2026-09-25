import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScannerPage from './components/ScannerPage';
import ResultsPage from './components/ResultsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-saas-bg text-saas-text flex flex-col font-sans selection:bg-saas-blue/10 selection:text-saas-blue">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Routes>
          <Route path="/" element={<ScannerPage defaultTab="url" />} />
          <Route path="/scan/url" element={<ScannerPage defaultTab="url" />} />
          <Route path="/scan/message" element={<ScannerPage defaultTab="message" />} />
          <Route path="/results/url/:scanId" element={<ResultsPage />} />
          <Route path="/results/message/:scanId" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-saas-border bg-saas-surface py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-saas-subtle">
          <div>
            <span className="font-bold text-saas-text">ScamShield</span>
            <span className="mx-2">•</span>
            <span>Detect. Verify. Stay Safe.</span>
          </div>

          <div className="text-saas-muted font-medium">
            Evidence-Based Security Analysis
          </div>

          <div className="text-saas-subtle">
            Made with ❤️ by <strong className="text-saas-text">CIPERPY</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
