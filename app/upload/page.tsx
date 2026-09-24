'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  AlertCircle,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import type { Platform } from '@/lib/types';

const CATEGORIES = [
  { value: 'action', label: 'اکشن' },
  { value: 'adventure', label: 'ماجراجویی' },
  { value: 'rpg', label: 'نقش‌آفرینی' },
  { value: 'strategy', label: 'استراتژی' },
  { value: 'sports', label: 'ورزشی' },
  { value: 'racing', label: 'مسابقه‌ای' },
  { value: 'puzzle', label: 'پازل' },
  { value: 'casual', label: 'سرگرمی' },
  { value: 'simulation', label: 'شبیه‌سازی' },
  { value: 'other', label: 'سایر' },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'windows', label: 'ویندوز' },
  { value: 'android', label: 'اندروید' },
  { value: 'ios', label: 'iOS' },
];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('action');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router, supabase.auth]);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('حجم تصویر کاور باید کمتر از ۲ مگابایت باشد');
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // اعتبارسنجی
    if (!title.trim()) return setError('عنوان بازی الزامی است');
    if (platforms.length === 0) return setError('حداقل یک پلتفرم انتخاب کن');
    if (!coverFile) return setError('تصویر کاور الزامی است');

    // اگر iOS انتخاب شده، لینک الزامی است
    if (platforms.includes('ios') && !storeUrl.trim()) {
      return setError('برای iOS، لینک App Store الزامی است');
    }

    // اگر ویندوز یا اندروید انتخاب شده، فایل الزامی است
    const needsFile = platforms.includes('windows') || platforms.includes('android');
    if (needsFile && !gameFile) {
      return setError('برای ویندوز یا اندروید، فایل بازی الزامی است');
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('لطفاً دوباره وارد شوید');

      // ۱. ساخت slug یکتا
      const baseSlug =
        titleEn
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `game-${Date.now()}`;

      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      // ۲. آپلود کاور
      const coverExt = coverFile.name.split('.').pop();
      const coverPath = `covers/${user.id}/${slug}.${coverExt}`;

      const { error: coverError } = await supabase.storage
        .from('games')
        .upload(coverPath, coverFile);
      if (coverError) throw coverError;

      const { data: coverData } = supabase.storage
        .from('games')
        .getPublicUrl(coverPath);

      // ۳. آپلود فایل بازی (اگر وجود داره)
      let filePath: string | null = null;
      let fileSize: number | null = null;

      if (gameFile) {
        const fileExt = gameFile.name.split('.').pop();
        filePath = `files/${user.id}/${slug}.${fileExt}`;
        fileSize = gameFile.size;

        const { error: fileError } = await supabase.storage
          .from('games')
          .upload(filePath, gameFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (fileError) throw fileError;
      }

      // ۴. درج در دیتابیس
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          slug,
          title: title.trim(),
          title_en: titleEn.trim() || null,
          description: description.trim() || null,
          developer_id: user.id,
          cover_url: coverData.publicUrl,
          category,
          platform: platforms,
          status: 'pending',
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // ۵. درج نسخه‌های ویندوز/اندروید
      if (filePath) {
        const platformForFile = platforms.includes('windows') ? 'windows' : 'android';
        const { error: versionError } = await supabase
          .from('game_versions')
          .insert({
            game_id: gameData.id,
            platform: platformForFile,
            version: '1.0.0',
            file_path: filePath,
            file_size: fileSize,
          });
        if (versionError) throw versionError;
      }

      // ۶. درج نسخه iOS (لینک App Store)
      if (platforms.includes('ios') && storeUrl.trim()) {
        const { error: iosError } = await supabase
          .from('game_versions')
          .insert({
            game_id: gameData.id,
            platform: 'ios',
            version: '1.0.0',
            store_url: storeUrl.trim(),
          });
        if (iosError) throw iosError;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container-main" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ← بازگشت به داشبورد
          </Link>
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            انتشار بازی جدید
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            بازی شما پس از بررسی تیم مدیریت منتشر خواهد شد
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <Field label="عنوان بازی" required>
            <input
              type="text"
              className="input"
              placeholder="مثلاً: ماجراجویی در تهران"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>

          <Field label="عنوان انگلیسی (برای URL)" hint="اختیاری">
            <input
              type="text"
              className="input"
              placeholder="Tehran Adventure"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              dir="ltr"
            />
          </Field>

          <Field label="توضیحات">
            <textarea
              className="input"
              rows={5}
              placeholder="درباره بازی بنویس..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>

          <Field label="دسته‌بندی">
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} style={{ background: 'var(--surface)' }}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="پلتفرم‌ها" required>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`badge badge-${p.value}`}
                  style={{
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    border: platforms.includes(p.value)
                      ? '2px solid currentColor'
                      : '2px solid transparent',
                    opacity: platforms.includes(p.value) ? 1 : 0.5,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="تصویر کاور" required hint="حداکثر ۲ مگابایت">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <label
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '1rem',
                  border: '2px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--background)',
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImagePlus size={28} style={{ color: 'var(--text-muted)' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                />
              </label>
              <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.9rem', paddingTop: '0.5rem' }}>
                یک تصویر مربعی با کیفیت بالا انتخاب کن. این تصویر در لیست بازی‌ها نمایش داده می‌شود.
              </div>
            </div>
          </Field>

          {/* فایل بازی (فقط اگه ویندوز یا اندروید انتخاب شده) */}
          {(platforms.includes('windows') || platforms.includes('android')) && (
            <Field
              label="فایل بازی"
              hint="حداکثر ۵۰۰ مگابایت - فرمت‌های مجاز: ZIP, APK, EXE, RAR, 7Z"
              required
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.25rem',
                  border: '2px dashed var(--border)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  background: 'var(--background)',
                }}
              >
                <Upload size={22} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: gameFile ? 'var(--text)' : 'var(--text-muted)' }}>
                  {gameFile
                    ? `${gameFile.name} (${(gameFile.size / 1024 / 1024).toFixed(1)} MB)`
                    : 'برای انتخاب فایل کلیک کن'}
                </span>
                <input
                  type="file"
                  accept=".zip,.apk,.exe,.rar,.7z"
                  onChange={(e) => setGameFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
            </Field>
          )}

          {/* لینک App Store (فقط اگه iOS انتخاب شده) */}
          {platforms.includes('ios') && (
            <Field label="لینک App Store" hint="الزامی برای iOS" required>
              <input
                type="url"
                className="input"
                placeholder="https://apps.apple.com/app/id..."
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                dir="ltr"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                اپل اجازه توزیع مستقیم فایل iOS رو نمی‌ده. بازی شما باید در App Store منتشر شده باشه و لینکش رو اینجا وارد کنی.
              </p>
            </Field>
          )}

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
                در حال آپلود...
              </>
            ) : (
              <>
                <Upload size={18} />
                ارسال برای بررسی
              </>
            )}
          </button>
        </form>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        <span>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </span>
        {hint && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}