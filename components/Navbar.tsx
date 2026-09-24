'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gamepad2, Search, User, LogOut, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // گرفتن کاربر فعلی
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // گوش دادن به تغییرات احراز هویت
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav
      style={{
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container-main">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem',
          }}
        >
          {/* لوگو */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--primary)',
            }}
          >
            <Gamepad2 size={28} />
            <span>بازیکن</span>
          </Link>

          {/* لینک‌های میانی */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link
              href="/games"
              style={{ color: 'var(--text-muted)', fontWeight: 500 }}
            >
              بازی‌ها
            </Link>
            <Link
              href="/games?platform=windows"
              style={{ color: 'var(--text-muted)', fontWeight: 500 }}
            >
              ویندوز
            </Link>
            <Link
              href="/games?platform=android"
              style={{ color: 'var(--text-muted)', fontWeight: 500 }}
            >
              اندروید
            </Link>
            <Link
              href="/games?platform=ios"
              style={{ color: 'var(--text-muted)', fontWeight: 500 }}
            >
              iOS
            </Link>
          </div>

          {/* بخش کاربر */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {loading ? (
              <div
                style={{
                  width: '100px',
                  height: '40px',
                  background: 'var(--surface)',
                  borderRadius: '0.75rem',
                }}
              />
            ) : user ? (
              <>
                <Link href="/upload" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <Upload size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} />
                  آپلود بازی
                </Link>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                  <User size={22} />
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                  title="خروج"
                >
                  <LogOut size={22} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  ورود
                </Link>
                <Link href="/login?mode=signup" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}