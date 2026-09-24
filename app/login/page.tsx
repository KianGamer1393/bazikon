'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') setMode('signup');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // اعتبارسنجی
        if (password.length < 8) {
          throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد');
        }
        if (username.length < 3) {
          throw new Error('نام کاربری باید حداقل ۳ کاراکتر باشد');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              display_name: username,
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setSuccess(
            'ثبت‌نام موفق! لطفاً ایمیل خود را برای تأیید بررسی کنید.'
          );
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
      }}
    >
      {/* پس‌زمینه گرادیانت */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        {/* لوگو */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '1rem',
            }}
          >
            <Gamepad2 size={32} />
            بازیکن
          </Link>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {mode === 'login' ? 'خوش آمدی!' : 'ساخت حساب جدید'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login'
              ? 'برای ادامه وارد حساب کاربری خود شوید'
              : 'برای انتشار بازی، حساب بسازید'}
          </p>
        </div>

        {/* تب‌ها */}
        <div
          style={{
            display: 'flex',
            background: 'var(--background)',
            borderRadius: '0.75rem',
            padding: '0.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: mode === 'login' ? 'var(--primary)' : 'transparent',
              color: mode === 'login' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ورود
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: mode === 'signup' ? 'var(--primary)' : 'transparent',
              color: mode === 'signup' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ثبت‌نام
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                نام کاربری
              </label>
              <div style={{ position: 'relative' }}>
                <User
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
                  type="text"
                  className="input"
                  style={{ paddingRight: '2.75rem' }}
                  placeholder="مثلاً: ali_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              ایمیل
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
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
                type="email"
                className="input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              رمز عبور
            </label>
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
                placeholder="حداقل ۸ کاراکتر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                dir="ltr"
              />
            </div>
          </div>

          {/* پیام خطا */}
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

          {/* پیام موفقیت */}
          {success && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                در حال پردازش...
              </>
            ) : mode === 'login' ? (
              'ورود'
            ) : (
              'ثبت‌نام'
            )}
          </button>
        </form>

        {/* لینک پایین */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}
        >
          {mode === 'login' ? 'حساب نداری؟ ' : 'قبلاً ثبت‌نام کردی؟ '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          >
            {mode === 'login' ? 'ثبت‌نام کن' : 'وارد شو'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <LoginForm />
      </Suspense>
    </>
  );
}