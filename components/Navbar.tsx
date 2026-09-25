'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gamepad2, User, LogOut, Upload, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

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

          {/* لینک‌های دسکتاپ */}
          <div className="hide-mobile" style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/games" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              بازی‌ها
            </Link>
            <Link href="/games?platform=windows" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              ویندوز
            </Link>
            <Link href="/games?platform=android" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              اندروید
            </Link>
            <Link href="/games?platform=ios" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              iOS
            </Link>
          </div>

          {/* بخش کاربر - دسکتاپ */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {loading ? (
              <div style={{ width: '100px', height: '40px', background: 'var(--surface)', borderRadius: '0.75rem' }} />
            ) : user ? (
              <>
                <Link href="/upload" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <Upload size={18} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                  آپلود
                </Link>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                  <User size={22} />
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
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

          {/* دکمه منو - موبایل */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="show-mobile"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* منوی موبایل */}
        {menuOpen && (
          <div
            className="show-mobile"
            style={{
              paddingBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link href="/games" style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }} onClick={() => setMenuOpen(false)}>
              بازی‌ها
            </Link>
            <Link href="/games?platform=windows" style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }} onClick={() => setMenuOpen(false)}>
              ویندوز
            </Link>
            <Link href="/games?platform=android" style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }} onClick={() => setMenuOpen(false)}>
              اندروید
            </Link>
            <Link href="/games?platform=ios" style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }} onClick={() => setMenuOpen(false)}>
              iOS
            </Link>
            {user ? (
              <>
                <Link href="/upload" className="btn-secondary" onClick={() => setMenuOpen(false)}>
                  آپلود بازی
                </Link>
                <Link href="/dashboard" className="btn-secondary" onClick={() => setMenuOpen(false)}>
                  داشبورد
                </Link>
                <button onClick={handleLogout} className="btn-secondary" style={{ textAlign: 'right' }}>
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>
                  ورود
                </Link>
                <Link href="/login?mode=signup" className="btn-primary" onClick={() => setMenuOpen(false)}>
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}