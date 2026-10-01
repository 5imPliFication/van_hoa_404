import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Volume2, VolumeX, Shield, RefreshCw, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { phase, soundEnabled, toggleSound, resetGame, scores, setPhase, player } = useGameStore();

  const getPhaseTitle = () => {
    switch (phase) {
      case 'setup':
        return 'Tạo Hồ Sơ';
      case 'feed':
        return 'Mô Phỏng Feed Mạng Xã Hội';
      case 'core':
        return 'Phân Loại 3 Tính Chất Văn Hóa';
      case 'strategy':
        return 'Bàn Chiến Lược Xây & Chống';
      case 'timeline':
        return 'Dòng Thời Gian Hậu Quả';
      case 'result':
        return 'Hồ Sơ Công Dân Văn Hóa Số';
      default:
        return 'VĂN HÓA 404';
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(253, 251, 247, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      padding: '12px 20px',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        {/* Brand logo & Phase title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => setPhase('landing')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--color-primary)',
            }}
          >
            <span style={{
              background: 'var(--color-primary)',
              color: '#FFF',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              letterSpacing: '1px'
            }}>
              404
            </span>
            <span style={{ display: 'none', minWidth: '0' }} className="mobile-hide">
              VĂN HÓA
            </span>
          </div>

          {phase !== 'landing' && (
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              borderLeft: '2px solid #E2E8F0',
              paddingLeft: '12px',
            }}>
              {getPhaseTitle()}
            </div>
          )}
        </div>

        {/* Live score meter summary during game */}
        {phase !== 'landing' && phase !== 'result' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              <Shield size={16} color="var(--color-primary)" />
              <span>Sức khỏe CĐ:</span>
              <strong style={{ color: scores.communityHealth < 40 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {scores.communityHealth}%
              </strong>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              👤 <strong>{player.nickname}</strong>
            </div>
          </div>
        )}

        {/* Control actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPhase('sources')}
            title="Nguồn học liệu"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
            }}
          >
            <BookOpen size={18} />
          </button>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: soundEnabled ? 'rgba(218, 37, 29, 0.1)' : 'transparent',
              color: soundEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {phase !== 'landing' && (
            <button
              onClick={resetGame}
              title="Chơi lại từ đầu"
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--color-text-muted)',
              }}
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
