import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { ArrowRight, UserCheck } from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'avatar_1', name: 'Công dân Số A', src: 'https://api.dicebear.com/7.x/bottts/svg?seed=CitizenAlpha' },
  { id: 'avatar_2', name: 'Công dân Số B', src: 'https://api.dicebear.com/7.x/bottts/svg?seed=CitizenBeta' },
  { id: 'avatar_3', name: 'Công dân Số C', src: 'https://api.dicebear.com/7.x/bottts/svg?seed=CitizenGamma' },
  { id: 'avatar_4', name: 'Công dân Số D', src: 'https://api.dicebear.com/7.x/bottts/svg?seed=CitizenDelta' },
];

export const SetupScreen: React.FC = () => {
  const { player, setPlayer, setPhase } = useGameStore();
  const [nickname, setNickname] = useState(player.nickname || 'Sinh viên SPST');
  const [avatarId, setAvatarId] = useState(player.avatarId || 'avatar_1');
  const [groupCode, setGroupCode] = useState(player.groupCode || 'HCM202-FPT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayer({
      nickname: nickname.trim() || 'Người dùng 404',
      avatarId,
      groupCode: groupCode.trim(),
    });
    setPhase('feed');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in">
      <div className="glass-card" style={{ padding: '32px', boxShadow: 'var(--shadow-lg)' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(218, 37, 29, 0.1)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <UserCheck size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '6px' }}>
            Hồ Sơ Điều Phối Viên
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Thiết lập danh tính trước khi gia nhập mạng xã hội giả lập.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Nickname Field */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: '#334155' }}>
              Tên / Biệt danh của bạn:
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nhập biệt danh..."
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #CBD5E1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: '#334155' }}>
              Chọn Avatar đại diện:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = avatarId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setAvatarId(preset.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      background: isSelected ? 'rgba(218, 37, 29, 0.08)' : '#F8FAFC',
                      border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid #E2E8F0',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img
                      src={preset.src}
                      alt={preset.name}
                      style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group / Class Code */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: '#334155' }}>
              Mã Lớp / Nhóm học tập (Tùy chọn):
            </label>
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="VD: HCM202-FPT..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #CBD5E1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Alert Message */}
          <div style={{
            background: '#FFFBEB',
            borderLeft: '4px solid #F59E0B',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#B45309',
            lineHeight: 1.4,
          }}>
            💬 <strong>Lưu ý:</strong> Mỗi hành động chia sẻ hay báo cáo trong game sẽ ảnh hưởng trực tiếp đến môi trường văn hóa mạng xã hội.
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(218, 37, 29, 0.3)',
            }}
          >
            <span>VÀO BẢNG FEED THỰC THI</span>
            <ArrowRight size={20} />
          </button>
        </form>

      </div>
    </div>
  );
};
