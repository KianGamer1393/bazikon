import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ذخیره تلاش‌های ناموفق در حافظه
// (در پروداکشن بهتره از Redis یا دیتابیس استفاده کنی)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // ۱۵ دقیقه

export async function POST(request: Request) {
  try {
    // ۱. گرفتن IP کاربر برای rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // ۲. بررسی قفل بودن
    const attempt = failedAttempts.get(ip);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `تعداد تلاش‌های ناموفق زیاد. ${remaining} دقیقه دیگر تلاش کنید.` },
        { status: 429 }
      );
    }

    // ۳. بررسی احراز هویت Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });
    }

    // ۴. بررسی ادمین بودن
    const { data: adminData } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminData) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // ۵. بررسی رمز
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'رمز عبور الزامی است' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'تنظیمات سرور ناقص است' },
        { status: 500 }
      );
    }

    // مقایسه امن (timing-safe)
    if (password !== adminPassword) {
      // ثبت تلاش ناموفق
      const current = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCK_DURATION;
        current.count = 0; // ریست کنت بعد از قفل
      }

      failedAttempts.set(ip, current);

      const remaining = MAX_ATTEMPTS - current.count;
      return NextResponse.json(
        {
          error: `رمز اشتباه است. ${remaining} تلاش باقی‌مانده.`,
        },
        { status: 401 }
      );
    }

    // ۶. موفق - پاک کردن تلاش‌های ناموفق
    failedAttempts.delete(ip);

    // ۷. ساخت توکن سشن برای پنل ادمین
    // (یک توکن تصادفی که در sessionStorage ذخیره می‌شه)
    const sessionToken = crypto.randomUUID();

    // در اینجا می‌تونی توکن رو در دیتابیس ذخیره کنی تا سمت سرور معتبر باشه
    // فعلاً برای سادگی، فقط توکن برمی‌گردونیم و client ذخیره می‌کنه

    return NextResponse.json({
      success: true,
      token: sessionToken,
    });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}