import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Shield, Sparkles, BookOpen, Play, CheckCircle2 } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { setPhase } = useGameStore();

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '0 20px',
      textAlign: 'center',
    }} className="animate-fade-in">

      {/* Main Hero Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(218, 37, 29, 0.1)',
        color: 'var(--color-primary)',
        fontWeight: 700,
        fontSize: '0.85rem',
        marginBottom: '20px',
      }}>
        <Sparkles size={16} />
        <span>Trải nghiệm Học tập Tương tác Web • 10–15 Phút</span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        fontWeight: 800,
        color: 'var(--color-text-main)',
        marginBottom: '12px',
        lineHeight: 1.1,
      }}>
        VĂN HÓA <span style={{
          color: 'var(--color-primary)',
          background: 'linear-gradient(135deg, #DA251D, #A31913)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>404</span>
      </h1>

      <p style={{
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '24px',
        maxWidth: '680px',
        margin: '0 auto 32px',
      }}>
        "Mỗi lượt thích, bình luận và chia sẻ đều là một lựa chọn văn hóa."
      </p>

      {/* Card Intro */}
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '40px',
        textAlign: 'left',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={22} />
          <span>Nhiệm vụ của bạn</span>
        </h3>

        <p style={{ fontSize: '1rem', color: '#334155', marginBottom: '20px', lineHeight: 1.6 }}>
          Bạn hóa thân thành người dùng điều phối mạng xã hội giả lập. Bạn sẽ đối mặt với các nội dung tin giả, cyberbullying, xuyên tạc di sản và thương mại hóa độc hại. Qua từng quyết định, bạn sẽ thấu hiểu tư tưởng Hồ Chí Minh về xây dựng nền văn hóa mới:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#FFF', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #DA251D' }}>
            <strong style={{ color: '#DA251D', display: 'block', marginBottom: '4px' }}>🇻🇳 DÂN TỘC</strong>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Bảo tồn bản sắc & trân trọng di sản lịch sử Việt Nam.</span>
          </div>

          <div style={{ background: '#FFF', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #0066FF' }}>
            <strong style={{ color: '#0066FF', display: 'block', marginBottom: '4px' }}>🔬 KHOA HỌC</strong>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Kiểm chứng thông tin, phản biện có cơ sở thực tiễn.</span>
          </div>

          <div style={{ background: '#FFF', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10B981' }}>
            <strong style={{ color: '#10B981', display: 'block', marginBottom: '4px' }}>👥 ĐẠI CHÚNG</strong>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Tôn trọng nhân phẩm, vì lợi ích sức khỏe cộng đồng.</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569', background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span>Vận hành theo nguyên tắc <strong>"Xây đi đôi với Chống"</strong> — Lấy cái đẹp dẹp cái xấu.</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPhase('setup')}
          style={{
            padding: '16px 36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(218, 37, 29, 0.35)',
          }}
        >
          <Play size={22} fill="#FFF" />
          <span>BẮT ĐẦU TRẢI NGHIỆM</span>
        </button>

        <button
          onClick={() => setPhase('sources')}
          style={{
            padding: '16px 28px',
            borderRadius: 'var(--radius-full)',
            background: '#FFFFFF',
            color: 'var(--color-text-main)',
            fontWeight: 700,
            fontSize: '1rem',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <BookOpen size={18} />
          <span>Nguồn Học Liệu</span>
        </button>
      </div>

    </div>
  );
};
