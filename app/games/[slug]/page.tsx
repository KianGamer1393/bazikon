import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import DownloadButton from '@/components/DownloadButton';
import { Gamepad2, Download, Calendar, Tag, ArrowRight } from 'lucide-react';
import type { Platform } from '@/lib/types';

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (error || !game) {
    notFound();
  }

  // گرفتن نسخه‌ها
  const { data: versions } = await supabase
    .from('game_versions')
    .select('*')
    .eq('game_id', game.id);

  const createdDate = new Date(game.created_at).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const platformLabel = (p: Platform): string => {
    if (p === 'windows') return 'ویندوز';
    if (p === 'android') return 'اندروید';
    return 'iOS';
  };

  return (
    <>
      <Navbar />
      <main className="container-main" style={{ padding: '2rem 1.5rem' }}>
        {/* بازگشت */}
        <Link
          href="/games"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowRight size={16} />
          بازگشت به لیست بازی‌ها
        </Link>

        {/* هدر بازی */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            {/* کاور */}
            <div
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--surface)',
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
                <Gamepad2 size={64} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            {/* اطلاعات */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  marginBottom: '0.5rem',
                }}
              >
                {game.title}
              </h1>

              {game.title_en && (
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    marginBottom: '1rem',
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
                  marginBottom: '1.5rem',
                }}
              >
                {(game.platform as Platform[]).map((p) => (
                  <span
                    key={p}
                    className={`badge badge-${p}`}
                    style={{ padding: '0.4rem 0.9rem' }}
                  >
                    {platformLabel(p)}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Download size={16} />
                  {game.downloads?.toLocaleString('fa-IR') || 0} دانلود
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} />
                  {createdDate}
                </span>
                {game.category && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={16} />
                    {game.category}
                  </span>
                )}
              </div>

              {/* دکمه دانلود */}
              <DownloadButton
                gameId={game.id}
                versions={versions || []}
                platforms={game.platform as Platform[]}
              />
            </div>
          </div>
        </div>

        {/* توضیحات */}
        {game.description && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>درباره این بازی</h2>
            <p
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.9,
                whiteSpace: 'pre-wrap',
              }}
            >
              {game.description}
            </p>
          </div>
        )}
      </main>
    </>
  );
}