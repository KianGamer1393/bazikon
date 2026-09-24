import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import { Plus, Gamepad2, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import type { Game } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // گرفتن بازی‌های این توسعه‌دهنده
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  const myGames: Game[] = games || [];

  // آمار
  const stats = {
    total: myGames.length,
    approved: myGames.filter((g) => g.status === 'approved').length,
    pending: myGames.filter((g) => g.status === 'pending').length,
    rejected: myGames.filter((g) => g.status === 'rejected').length,
    downloads: myGames.reduce((sum, g) => sum + (g.downloads || 0), 0),
  };

  return (
    <>
      <Navbar />

      <main className="container-main" style={{ padding: '2rem 1.5rem' }}>
        {/* هدر */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              داشبورد توسعه‌دهنده
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              خوش آمدی، {user.user_metadata?.username || user.email}
            </p>
          </div>
          <Link href="/upload" className="btn-primary">
            <Plus
              size={20}
              style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'middle' }}
            />
            بازی جدید
          </Link>
        </div>

        {/* کارت‌های آمار */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <StatCard
            icon={<Gamepad2 size={22} />}
            label="کل بازی‌ها"
            value={stats.total}
            color="var(--primary)"
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="تأییدشده"
            value={stats.approved}
            color="var(--success)"
          />
          <StatCard
            icon={<Clock size={22} />}
            label="در انتظار"
            value={stats.pending}
            color="var(--warning)"
          />
          <StatCard
            icon={<XCircle size={22} />}
            label="ردشده"
            value={stats.rejected}
            color="var(--danger)"
          />
          <StatCard
            icon={<Download size={22} />}
            label="کل دانلودها"
            value={stats.downloads}
            color="#a855f7"
          />
        </div>

        {/* لیست بازی‌ها */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>بازی‌های من</h2>

        {myGames.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-muted)',
            }}
          >
            <Gamepad2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ marginBottom: '1.5rem' }}>هنوز بازی‌ای منتشر نکردی</p>
            <Link href="/upload" className="btn-primary">
              اولین بازی رو آپلود کن
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myGames.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          color,
          marginBottom: '0.75rem',
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        {value.toLocaleString('fa-IR')}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

function GameRow({ game }: { game: Game }) {
  const statusConfig = {
    pending: { label: 'در انتظار تأیید', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.15)' },
    approved: { label: 'تأییدشده', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.15)' },
    rejected: { label: 'ردشده', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)' },
  };

  const status = statusConfig[game.status];

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        padding: '1rem 1.25rem',
      }}
    >
      {/* کاور */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '0.75rem',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
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
          <Gamepad2 size={24} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* اطلاعات */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: '1.1rem',
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {game.title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {game.platform.map((p) => (
            <span key={p} className={`badge badge-${p}`}>
              {p === 'windows' ? 'ویندوز' : p === 'android' ? 'اندروید' : 'iOS'}
            </span>
          ))}
        </div>
      </div>

      {/* آمار */}
      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          display: 'none',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
          {game.downloads?.toLocaleString('fa-IR') || 0}
        </div>
        دانلود
      </div>

      {/* وضعیت */}
      <span
        className="badge"
        style={{
          background: status.bg,
          color: status.color,
          padding: '0.4rem 0.75rem',
          whiteSpace: 'nowrap',
        }}
      >
        {status.label}
      </span>
    </div>
  );
}