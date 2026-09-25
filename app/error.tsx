'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '480px', padding: '3rem 2rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <AlertCircle size={36} style={{ color: 'var(--danger)' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>یه مشکلی پیش اومد</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          یه خطای غیرمنتظره رخ داد. می‌تونی دوباره تلاش کنی یا به صفحه اصلی برگردی.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn-primary">
            <RotateCcw size={18} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            تلاش مجدد
          </button>
          <Link href="/" className="btn-secondary">
            <Home size={18} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}