import React, { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const ConsequenceToast: React.FC = () => {
  const { toasts, dismissToast } = useGameStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dismissToast(toasts[0].id);
      }, toasts[0].durationMs || 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: 'calc(100vw - 48px)',
    }}>
      {toasts.map((toast) => {
        const isConsequence = toast.type === 'consequence' || toast.type === 'warning';
        const isPositive = toast.type === 'positive';

        return (
          <div
            key={toast.id}
            className="animate-float-up"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: isConsequence
                ? 'linear-gradient(135deg, #1E293B, #0F172A)'
                : isPositive
                ? 'linear-gradient(135deg, #064E3B, #047857)'
                : 'linear-gradient(135deg, #1E1B4B, #312E81)',
              color: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              border: isConsequence
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ marginTop: '2px' }}>
              {isConsequence ? (
                <AlertTriangle color="#EF4444" size={20} />
              ) : isPositive ? (
                <CheckCircle2 color="#34D399" size={20} />
              ) : (
                <Info color="#60A5FA" size={20} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                padding: '2px',
                borderRadius: '4px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
