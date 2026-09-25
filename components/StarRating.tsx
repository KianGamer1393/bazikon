'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({
  value,
  onChange,
  size = 20,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            style={{
              background: 'none',
              border: 'none',
              cursor: readonly ? 'default' : 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <Star
              size={size}
              fill={filled ? '#f59e0b' : 'transparent'}
              color={filled ? '#f59e0b' : 'var(--text-muted)'}
            />
          </button>
        );
      })}
    </div>
  );
}