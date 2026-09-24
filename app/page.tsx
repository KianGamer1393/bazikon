import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Gamepad2, Download, Shield, Zap } from 'lucide-react';
import type { Game } from '@/lib/types';

export default async function HomePage() {
  const supabase = await createClient();

  // ۸ بازی اخیر
  const { data: recentGames } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(8);

  const games: Game[] = recentGames || [];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          padding: '6rem 0 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container-main fade-in" style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
            }}
          >
            <Zap size={16} style={{ color: 'var(--warning)' }} />
            کاملاً رایگان و بدون تبلیغ
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            بازار بازی‌های{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              رایگان
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}
          >
            بازی‌های ویندوز، اندروید و iOS رو به صورت کاملاً رایگان دانلود کن.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/games" className="btn-primary" style={{ fontSize: '1.1rem' }}>
              <Gamepad2 size={22} style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }} />
              مشاهده بازی‌ها
            </Link>
            <Link href="/login?mode=signup" className="btn-secondary" style={{ fontSize: '1.1rem' }}>
              انتشار بازی
            </Link>
          </div>
        </div>
      </section>

      {/* بازی‌های اخیر */}
      {games.length > 0 && (
        <section style={{ padding: '2rem 0 4rem' }}>
          <div className="container-main">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <h2 style={{ fontSize: '1.75rem' }}>جدیدترین بازی‌ها</h2>
              <Link href="/games" style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                مشاهده همه →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', display: 'block' }}
                >
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      background: 'var(--background)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {game.cover_url ? (
                      <img
                        src={game.cover_url}
                        alt={game.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Gamepad2 size={48} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                  <div style={{ padding: '0.85rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {game.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {game.platform.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className={`badge badge-${p}`}
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
                        >
                          {p === 'windows' ? 'ویندوز' : p === 'android' ? 'اندروید' : 'iOS'}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ویژگی‌ها */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container-main">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              { icon: <Download size={32} />, title: 'دانلود مستقیم', desc: 'بدون واسطه، بدون صف، با سرعت بالا' },
              { icon: <Shield size={32} />, title: 'امنیت تضمین‌شده', desc: 'همه فایل‌ها قبل از انتشار بررسی می‌شن' },
              { icon: <Zap size={32} />, title: 'کاملاً رایگان', desc: 'بدون تبلیغ، بدون اشتراک، برای همیشه' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <div className="container-main">
          © {new Date().getFullYear()} بازیکن — ساخته شده با ❤️ برای گیمرها
        </div>
      </footer>
    </>
  );
}