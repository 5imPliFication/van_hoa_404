import React, { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { generateFinalSummary } from '../engine/endingEngine';
import confetti from 'canvas-confetti';
import { Award, BookOpen, RefreshCw, Share2, ShieldCheck } from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const { scores, player, setPhase, resetGame, addToast } = useGameStore();
  const summary = generateFinalSummary(scores);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DA251D', '#FFB800', '#10B981', '#3B82F6'],
      });
    } catch {}
  }, []);

  const handleShare = () => {
    const text = `🇻🇳 Tôi vừa nhận Hồ Sơ Công Dân Văn Hóa Số: [${summary.archetype.badge} ${summary.archetype.title}] tại VĂN HÓA 404! Chỉ số Hiệu quả Văn hóa: ${summary.culturalEffectiveness}%.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast({
        title: 'Đã sao chép kết quả!',
        message: 'Nội dung chia sẻ đã được lưu vào bộ nhớ tạm. Hãy chia sẻ lên mạng xã hội!',
        type: 'positive',
      });
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">

      {/* Main Profile Header */}
      <div className="dark-glass-card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>

        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          fontSize: '10rem',
          opacity: 0.05,
          pointerEvents: 'none',
        }}>
          {summary.archetype.badge}
        </div>

        <div className="badge badge-gold" style={{ marginBottom: '12px' }}>
          HỒ SƠ CÔNG DÂN VĂN HÓA SỐ
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
          {player.nickname}
        </h1>

        <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '20px' }}>
          {player.groupCode ? `Lớp/Nhóm: ${player.groupCode}` : 'Hệ sinh thái Văn Hóa 404'}
        </div>

        {/* Archetype Badge Display */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '20px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid rgba(255, 184, 0, 0.3)',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '3rem' }}>{summary.archetype.badge}</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>
            {summary.archetype.title}
          </h2>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E2E8F0' }}>
            "{summary.archetype.tagline}"
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 24px' }}>
          {summary.archetype.description}
        </p>

        {/* Total Scores Overview Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block' }}>HIỆU QUẢ VĂN HÓA</span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--color-gold)' }}>{summary.culturalEffectiveness}%</strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block' }}>CÂN BẰNG XÂY & CHỐNG</span>
            <strong style={{ fontSize: '1.8rem', color: '#34D399' }}>{summary.balanceScore}%</strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block' }}>SỨC KHỎE CỘNG ĐỒNG</span>
            <strong style={{ fontSize: '1.8rem', color: '#60A5FA' }}>{scores.communityHealth}%</strong>
          </div>
        </div>

      </div>

      {/* Detailed Metrics Breakdown */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--color-primary)" />
          <span>Bảng Chỉ Số Văn Hóa Chi Tiết</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {summary.metrics.map((metric) => (
            <div key={metric.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{metric.icon}</span> {metric.label}
                </span>
                <span style={{ color: metric.color }}>{metric.score}%</span>
              </div>

              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  width: `${metric.score}%`,
                  height: '100%',
                  background: metric.color,
                  borderRadius: '99px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Advice Box */}
      <div style={{
        background: '#EFF6FF',
        borderLeft: '5px solid #3B82F6',
        padding: '20px 24px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
      }}>
        <h4 style={{ color: '#1E40AF', fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} />
          <span>Lời khuyên phát triển tư duy văn hóa</span>
        </h4>
        <p style={{ color: '#1E293B', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {summary.archetype.advice}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(218, 37, 29, 0.3)',
          }}
        >
          <Share2 size={18} />
          <span>Chia Sẻ Hồ Sơ</span>
        </button>

        <button
          onClick={() => setPhase('sources')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: '#FFF',
            color: '#334155',
            fontWeight: 700,
            fontSize: '1rem',
            border: '1.5px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={18} />
          <span>Nguồn Học Liệu</span>
        </button>

        <button
          onClick={resetGame}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: '#FFF',
            color: '#334155',
            fontWeight: 700,
            fontSize: '1rem',
            border: '1.5px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={18} />
          <span>Chơi Lại Từ Đầu</span>
        </button>
      </div>

    </div>
  );
};
