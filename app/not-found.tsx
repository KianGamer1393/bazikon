import Link from 'next/link';
import { Gamepad2, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div className="fade-in" style={{ textAlign: 'center', position: 'relative' }}>
        <div
          style={{
            fontSize: '8rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          ۴۰۴
        </div>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Gamepad2 size={32} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          صفحه پیدا نشد
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          به نظر می‌رسه این صفحه وجود نداره یا حذف شده. بیا برگردیم به بازی‌ها!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">
            <Home size={18} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            صفحه اصلی
          </Link>
          <Link href="/games" className="btn-secondary">
            <Search size={18} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            جستجوی بازی
          </Link>
        </div>
      </div>
    </div>
  );
}