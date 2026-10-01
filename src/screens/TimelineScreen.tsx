import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Clock, Sparkles } from 'lucide-react';

export const TimelineScreen: React.FC = () => {
  const { choiceHistory, consequenceHistory, setPhase, player } = useGameStore();

  // Combine choices and delayed consequences into unified timeline
  const combinedTimeline = [
    ...choiceHistory.map((c, idx) => ({
      id: `choice_${idx}`,
      time: `09:${10 + idx * 15}`,
      title: `Quyết định: ${c.choiceLabel}`,
      subtitle: c.scenarioTitle,
      description: c.feedback,
      isConsequence: false,
    })),
    ...consequenceHistory.map((c, idx) => ({
      id: `consequence_${idx}`,
      time: `10:${20 + idx * 25}`,
      title: `⚡ Hậu quả xã hội: ${c.title}`,
      subtitle: 'Tác động cộng đồng',
      description: c.message,
      isConsequence: true,
    })),
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="badge badge-gold" style={{ marginBottom: '8px' }}>ACT 4: CÂN BẰNG TÁC ĐỘNG XÃ HỘI</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Dòng Thời Gian Hậu Quả Văn Hóa
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '580px', margin: '6px auto 0' }}>
          Mỗi quyết định nhỏ trên không gian mạng của <strong>{player.nickname}</strong> đều tạo ra gợn sóng tác động dây chuyền đến cộng đồng.
        </p>
      </div>

      {/* Timeline Node List */}
      <div style={{ position: 'relative', paddingLeft: '28px', marginBottom: '36px' }}>

        {/* Vertical Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '11px',
          top: '8px',
          bottom: '8px',
          width: '3px',
          background: 'linear-gradient(180deg, var(--color-primary), var(--color-gold), #10B981)',
          borderRadius: '99px',
        }} />

        {combinedTimeline.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'relative',
              marginBottom: '24px',
            }}
          >
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: '-28px',
              top: '4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: item.isConsequence ? '#DC2626' : '#10B981',
              border: '3px solid #FFF',
              boxShadow: '0 0 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }} />

            {/* Content Box */}
            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: item.isConsequence ? '#DC2626' : '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {item.time}
                </span>

                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {item.subtitle}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                {item.title}
              </h4>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* Proceed CTA */}
      <div>
        <button
          onClick={() => setPhase('result')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(218, 37, 29, 0.35)',
          }}
        >
          <Sparkles size={22} />
          <span>NHẬN HỒ SƠ CÔNG DÂN VĂN HÓA SỐ</span>
        </button>
      </div>

    </div>
  );
};
