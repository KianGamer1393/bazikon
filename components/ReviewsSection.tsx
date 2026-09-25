'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import StarRating from './StarRating';
import type { Review } from '@/lib/types';

export default function ReviewsSection({
  gameId,
  currentUserId,
}: {
  gameId: string;
  currentUserId?: string;
}) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, [gameId, currentUserId]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });

    setReviews(data || []);
    if (currentUserId && data) {
      setMyReview(data.find((r) => r.user_id === currentUserId) || null);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setError('برای ثبت نظر باید وارد شوید');
      return;
    }
    if (rating === 0) {
      setError('لطفاً امتیاز بدهید');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: upsertError } = await supabase
      .from('reviews')
      .upsert(
        {
          game_id: gameId,
          user_id: currentUserId,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: 'game_id,user_id' }
      );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setComment('');
      setRating(0);
      await loadReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!myReview) return;
    await supabase.from('reviews').delete().eq('id', myReview.id);
    setMyReview(null);
    await loadReviews();
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h2
        style={{
          fontSize: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <MessageSquare size={20} />
        نظرات و امتیازات ({reviews.length})
      </h2>

      {/* فرم ثبت نظر */}
      {currentUserId ? (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--background)',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              امتیاز شما
            </label>
            <StarRating value={myReview?.rating || rating} onChange={setRating} size={28} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              className="input"
              rows={3}
              placeholder="نظرت رو بنویس (اختیاری)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {myReview ? 'ویرایش نظر' : 'ثبت نظر'}
            </button>
            {myReview && (
              <button type="button" onClick={handleDelete} className="btn-secondary">
                حذف نظر
              </button>
            )}
          </div>
        </form>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          برای ثبت نظر، ابتدا وارد شوید.
        </p>
      )}

      {/* لیست نظرات */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
          هنوز نظری ثبت نشده. اولین نفر باش!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '1rem',
                background: 'var(--background)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <StarRating value={r.rating} size={16} readonly />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(r.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
              {r.comment && (
                <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}