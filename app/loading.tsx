import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
    </div>
  );
}