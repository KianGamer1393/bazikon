'use client';

import { useState } from 'react';
import { Download, Loader2, Apple, Monitor, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { GameVersion, Platform } from '@/lib/types';

const PLATFORM_INFO: Record<Platform, { label: string; icon: React.ReactNode }> = {
  windows: { label: 'دانلود برای ویندوز', icon: <Monitor size={18} /> },
  android: { label: 'دانلود برای اندروید', icon: <Smartphone size={18} /> },
  ios: { label: 'مشاهده در App Store', icon: <Apple size={18} /> },
};

export default function DownloadButton({
  gameId,
  versions,
  platforms,
}: {
  gameId: string;
  versions: GameVersion[];
  platforms: Platform[];
}) {
  const supabase = createClient();
  const [loadingPlatform, setLoadingPlatform] = useState<Platform | null>(null);

  const handleDownload = async (platform: Platform) => {
    const version = versions.find((v) => v.platform === platform);

    // iOS: لینک به App Store
    if (platform === 'ios') {
      if (version?.store_url) {
        window.open(version.store_url, '_blank');
      } else {
        alert('لینک App Store برای این بازی ثبت نشده');
      }
      return;
    }

    // ویندوز و اندروید: Signed URL
    if (!version?.file_path) {
      alert('فایل این بازی در دسترس نیست');
      return;
    }

    setLoadingPlatform(platform);
    try {
      // لینک با اعتبار ۶۰ ثانیه
      const { data, error } = await supabase.storage
        .from('games')
        .createSignedUrl(version.file_path, 60);

      if (error || !data) throw error || new Error('خطا در ساخت لینک');

      // ثبت دانلود (اختیاری - می‌تونی بعداً اضافه کنی)
      await supabase.rpc('increment_downloads', { game_id_input: gameId });

      // باز کردن لینک
      window.location.href = data.signedUrl;
    } catch (err: any) {
      alert(err.message || 'خطا در دانلود');
    } finally {
      setLoadingPlatform(null);
    }
  };

  // فقط پلتفرم‌هایی که نسخه دارن
  const availablePlatforms = platforms.filter((p) =>
    versions.some((v) => v.platform === p) || p === 'ios'
  );

  if (availablePlatforms.length === 0) {
    return (
      <div
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        فایل دانلود در دسترس نیست
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {availablePlatforms.map((p) => {
        const info = PLATFORM_INFO[p];
        const isLoading = loadingPlatform === p;

        return (
          <button
            key={p}
            onClick={() => handleDownload(p)}
            disabled={isLoading}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'wait' : 'pointer',
            }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : info.icon}
            {info.label}
          </button>
        );
      })}
    </div>
  );
}