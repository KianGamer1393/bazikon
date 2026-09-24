'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Check,
  X,
  Clock,
  Loader2,
  Gamepad2,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Game, Platform } from '@/lib/types';

export default function AdminPanelPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // بررسی امنیتی: رمز تأیید شده؟
    const verified = sessionStorage.getItem('admin_verified');
    const verifiedAt = sessionStorage.getItem('admin_verified_at');

    if (verified !== 'true' || !verifiedAt) {
      router.push('/admin-x7k9m2');
      return;
    }

    // بررسی انقضای سشن (۲ ساعت)
    const elapsed = Date.now() - parseInt(verifiedAt);
    if (elapsed > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem('admin_verified');
      sessionStorage.removeItem('admin_verified_at');
      sessionStorage.removeItem('admin_token');
      router.push('/admin-x7k9m2');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    const { data: gamesData } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    setGames(gamesData || []);
    setChecking(false);
  };

  const updateGameStatus = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    await supabase.from('games').update({ status }).eq('id', id);
    await loadData();
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_verified');
    sessionStorage.removeItem('admin_verified_at');
    sessionStorage.removeItem('admin_token');
    router.push('/admin-x7k9m2');
  };

  const pendingGames = games.filter((g) => g.status === 'pending');
  const approvedGames = games.filter((g) => g.status === 'approved');
  const rejectedGames = games.filter((g) => g.status === 'rejected');

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* هدر */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container-main"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>پنل مدیریت بازیکن</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <LogOut
              size={16}
              style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }}
            />
            خروج
          </button>
        </div>
      </header>

      <main className="container-main" style={{ padding: '2rem 1.5rem' }}>
        {/* آمار */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatBox label="در انتظار" value={pendingGames.length} color="var(--warning)" />
          <StatBox label="تأییدشده" value={approvedGames.length} color="var(--success)" />
          <StatBox label="ردشده" value={rejectedGames.length} color="var(--danger)" />
          <StatBox label="کل" value={games.length} color="var(--primary)" />
        </div>

        {/* بازی‌های در انتظار */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          در انتظار بررسی ({pendingGames.length})
        </h2>

        {pendingGames.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}
          >
            بازی جدیدی در انتظار بررسی نیست
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingGames.map((game) => (
              <AdminGameCard
                key={game.id}
                game={game}
                onApprove={() => updateGameStatus(game.id, 'approved')}
                onReject={() => updateGameStatus(game.id, 'rejected')}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* بازی‌های تأییدشده */}
        {approvedGames.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.25rem', margin: '2.5rem 0 1rem' }}>
              تأییدشده ({approvedGames.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {approvedGames.map((game) => (
                <CompactGameRow
                  key={game.id}
                  game={game}
                  onReject={() => updateGameStatus(game.id, 'rejected')}
                />
              ))}
            </div>
          </>
        )}

        {/* بازی‌های ردشده */}
        {rejectedGames.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.25rem', margin: '2.5rem 0 1rem' }}>
              ردشده ({rejectedGames.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rejectedGames.map((game) => (
                <div
                  key={game.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--background)',
                    }}
                  >
                    {game.cover_url ? (
                      <img
                        src={game.cover_url}
                        alt={game.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Gamepad2 size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {game.title}
                    </div>
                  </div>
                  <button
                    onClick={() => updateGameStatus(game.id, 'approved')}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--success)',
                      color: 'var(--success)',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    تأیید مجدد
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>
        {value.toLocaleString('fa-IR')}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

function platformLabel(p: Platform): string {
  if (p === 'windows') return 'ویندوز';
  if (p === 'android') return 'اندروید';
  return 'iOS';
}

function AdminGameCard({
  game,
  onApprove,
  onReject,
  loading,
}: {
  game: Game;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const platforms = (game.platform as Platform[]) || [];

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {game.cover_url ? (
            <img
              src={game.cover_url}
              alt={game.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Gamepad2 size={28} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{game.title}</h3>
          {game.title_en && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
              dir="ltr"
            >
              {game.title_en}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '0.5rem',
            }}
          >
            {platforms.map((p) => (
              <span key={p} className={`badge badge-${p}`}>
                {platformLabel(p)}
              </span>
            ))}
            {game.category && (
              <span
                className="badge"
                style={{ background: 'var(--background)', color: 'var(--text-muted)' }}
              >
                {game.category}
              </span>
            )}
          </div>
          {game.description && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}
            >
              {expanded
                ? game.description
                : game.description.substring(0, 150) +
                  (game.description.length > 150 ? '...' : '')}
            </p>
          )}
          {game.description && game.description.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0.25rem 0',
                fontFamily: 'inherit',
              }}
            >
              {expanded ? 'بستن' : 'بیشتر'}
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={onApprove}
          disabled={loading}
          style={{
            flex: 1,
            background: 'var(--success)',
            color: 'white',
            border: 'none',
            padding: '0.7rem',
            borderRadius: '0.75rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        >
          <Check size={18} />
          تأیید و انتشار
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            padding: '0.7rem',
            borderRadius: '0.75rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        >
          <X size={18} />
          رد
        </button>
      </div>
    </div>
  );
}

function CompactGameRow({
  game,
  onReject,
}: {
  game: Game;
  onReject: () => void;
}) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--background)',
        }}
      >
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Gamepad2 size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {game.title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {game.downloads?.toLocaleString('fa-IR') || 0} دانلود
        </div>
      </div>
      <span
        className="badge"
        style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}
      >
        <Check size={12} />
        تأییدشده
      </span>
      <button
        onClick={onReject}
        title="رد کردن"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.25rem',
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}