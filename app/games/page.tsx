import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import { Gamepad2, Search, Download, Star } from 'lucide-react';
import type { Game, Platform } from '@/lib/types';

async function GamesList({
  searchParams,
}: {
  searchParams: { platform?: string; category?: string; q?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (searchParams.platform) {
    query = query.contains('platform', [searchParams.platform]);
  }

  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`);
  }

  const { data: games, error } = await query;

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--danger)' }}>خطا در بارگذاری بازی‌ها</p>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div
        className="card"
        style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}
      >
        <Gamepad2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>بازی‌ای یافت نشد</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game as Game} />
      ))}
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const platforms = (game.platform as Platform[]) || [];

  const platformLabel = (p: Platform): string => {
    if (p === 'windows') return 'ویندوز';
    if (p === 'android') return 'اندروید';
    return 'iOS';
  };

  return (
    <Link
      href={`/games/${game.slug}`}
      className="card game-card"
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

        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            flexWrap: 'wrap',
            marginBottom: '0.5rem',
          }}
        >
          {platforms.slice(0, 3).map((p) => (
            <span
              key={p}
              className={`badge badge-${p}`}
              style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
            >
              {platformLabel(p)}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <Download size={14} />
            {game.downloads?.toLocaleString('fa-IR') || 0}
          </div>

          {game.review_count > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
              }}
            >
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              <span style={{ color: 'var(--text-muted)' }}>
                {Number(game.avg_rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FilterBar({ current }: { current: Record<string, string | undefined> }) {
  const platforms = [
    { value: '', label: 'همه' },
    { value: 'windows', label: 'ویندوز' },
    { value: 'android', label: 'اندروید' },
    { value: 'ios', label: 'iOS' },
  ];

  const buildUrl = (platform: string) => {
    const params = new URLSearchParams();
    if (platform) params.set('platform', platform);
    if (current.category) params.set('category', current.category);
    if (current.q) params.set('q', current.q);
    const qs = params.toString();
    return `/games${qs ? `?${qs}` : ''}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}
    >
      {platforms.map((p) => {
        const isActive = (current.platform || '') === p.value;
        return (
          <Link
            key={p.value}
            href={buildUrl(p.value)}
            className={isActive ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}

function SearchBar({ initialQuery }: { initialQuery?: string }) {
  return (
    <form method="GET" action="/games" style={{ marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        <Search
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
          name="q"
          className="input"
          style={{ paddingRight: '2.75rem' }}
          placeholder="جستجوی بازی..."
          defaultValue={initialQuery}
        />
      </div>
    </form>
  );
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Navbar />
      <main className="container-main" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>بازی‌ها</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            همه بازی‌های رایگان برای ویندوز، اندروید و iOS
          </p>
        </div>

        <SearchBar initialQuery={params.q} />
        <FilterBar current={params} />

        <Suspense
          fallback={
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              در حال بارگذاری...
            </div>
          }
        >
          <GamesList searchParams={params} />
        </Suspense>
      </main>
    </>
  );
}