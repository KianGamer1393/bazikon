'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // بررسی امنیتی: کاربر لاگین کرده؟
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // بررسی امنیتی: کاربر ادمین است؟
      const { data: adminData } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminData) {
        setError('دسترسی غیرمجاز');
        setChecking(false);
        return;
      }

      // بررسی امنیتی: قبلاً رمز وارد کرده؟
      const sessionVerified = sessionStorage.getItem('admin_verified');
      const sessionTime = sessionStorage.getItem('admin_verified_at');

      if (sessionVerified === 'true' && sessionTime) {
        const elapsed = Date.now() - parseInt(sessionTime);
        // اعتبار سشن: ۲ ساعت
        if (elapsed < 2 * 60 * 60 * 1000) {
          router.push('/admin-x7k9m2/panel');
          return;
        } else {
          // سشن منقضی شده - پاک کن
          sessionStorage.removeItem('admin_verified');
          sessionStorage.removeItem('admin_verified_at');
        }
      }

      setChecking(false);
    });
  }, [router, supabase]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'رمز اشتباه است');
      }

      // ذخیره سشن
      sessionStorage.setItem('admin_verified', 'true');
      sessionStorage.setItem('admin_verified_at', Date.now().toString());
      if (data.token) {
        sessionStorage.setItem('admin_token', data.token);
      }

      router.push('/admin-x7k9m2/panel');
    } catch (err: any) {
      setError(err.message || 'خطا در بررسی رمز');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (error === 'دسترسی غیرمجاز') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>دسترسی غیرمجاز</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            شما اجازه دسترسی به این پنل را ندارید.
          </p>
          <Link href="/" className="btn-secondary">
            <ArrowLeft size={16} style={{ display: 'inline', marginLeft: '0.5rem' }} />
            بازگشت به سایت
          </Link>
        </div>
      </div>
    );
  }

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
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Shield size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ورود به پنل مدیریت</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            رمز عبور ادمین را وارد کنید
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                className="input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || password.length < 6}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading || password.length < 6 ? 0.6 : 1,
              cursor: loading || password.length < 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                در حال بررسی...
              </>
            ) : (
              <>
                <Shield size={18} />
                تأیید و ورود
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          سشن ورود پس از ۲ ساعت منقضی می‌شود
        </p>
      </div>
    </div>
  );
}