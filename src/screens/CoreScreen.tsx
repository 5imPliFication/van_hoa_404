import { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { CoreType, Scenario } from '../types/game';
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const CoreScreen: React.FC = () => {
  const { scenarios, setPhase, classifyCard, classifiedCards } = useGameStore();

  const coreCards = scenarios
    .filter((s: Scenario) => s.coreClassification && s.coreClassification.enabled)
    .map((s: Scenario) => ({
      id: s.id,
      cardTitle: s.coreClassification.cardTitle,
      validCores: s.coreClassification.validCores,
      explanation: s.coreClassification.explanation,
    }));

  const [activeCardId, setActiveCardId] = useState<string | null>(coreCards[0]?.id || null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const activeCard = coreCards.find((c) => c.id === activeCardId);
  const totalClassified = Object.keys(classifiedCards).length;
  const isComplete = totalClassified >= coreCards.length;

  const handleClassify = (core: CoreType) => {
    if (!activeCard) return;

    const isValid = activeCard.validCores.includes(core);
    classifyCard(activeCard.id, core);

    if (isValid) {
      soundManager.playPositive();
      setFeedbackMessage(`✅ Chính xác! ${activeCard.explanation}`);
    } else {
      soundManager.playWarning();
      setFeedbackMessage(`💡 Gợi ý: Thẻ này thể hiện rõ nhất tính ${activeCard.validCores.join(' / ')}. (${activeCard.explanation})`);
    }

    // Move to next unclassified card automatically
    const nextUnclassified = coreCards.find((c) => c.id !== activeCard.id && !classifiedCards[c.id]);
    if (nextUnclassified) {
      setTimeout(() => {
        setActiveCardId(nextUnclassified.id);
        setFeedbackMessage(null);
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">

      {/* Screen Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="badge badge-gold" style={{ marginBottom: '8px' }}>ACT 2: PHÂN LOẠI 3 TÍNH CHẤT VĂN HÓA</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Hệ Thống Hóa Giá Trị Văn Hóa Số
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '6px auto 0' }}>
          Đưa các bài học hành vi bạn vừa thực hiện vào 3 trụ cột của nền văn hóa mới: <strong>Dân tộc – Khoa học – Đại chúng</strong>.
        </p>
      </div>

      {/* Core Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>

        <div
          onClick={() => activeCard && handleClassify('danToc')}
          style={{
            background: 'linear-gradient(135deg, #FFF, #FEF2F2)',
            border: '2px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: activeCard ? 'pointer' : 'default',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🇻🇳</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>DÂN TỘC</h3>
          <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: '4px' }}>
            Bảo tồn bản sắc, di sản lịch sử, lòng tự hào và văn hóa truyền thống Việt Nam.
          </p>
        </div>

        <div
          onClick={() => activeCard && handleClassify('khoaHoc')}
          style={{
            background: 'linear-gradient(135deg, #FFF, #EFF6FF)',
            border: '2px solid #93C5FD',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: activeCard ? 'pointer' : 'default',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🔬</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB' }}>KHOA HỌC</h3>
          <p style={{ fontSize: '0.82rem', color: '#1E3A8A', marginTop: '4px' }}>
            Kiểm chứng thông tin, chống tin giả, tư duy phản biện khách quan & tiến bộ.
          </p>
        </div>

        <div
          onClick={() => activeCard && handleClassify('daiChung')}
          style={{
            background: 'linear-gradient(135deg, #FFF, #ECFDF5)',
            border: '2px solid #6EE7B7',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: activeCard ? 'pointer' : 'default',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>👥</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>ĐẠI CHÚNG</h3>
          <p style={{ fontSize: '0.82rem', color: '#064E3B', marginTop: '4px' }}>
            Phục vụ nhân dân, bảo vệ nhân phẩm, tôn trọng cộng đồng & lan tỏa điều tốt.
          </p>
        </div>

      </div>

      {/* Cards to classify */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#334155' }}>
            <Layers size={20} color="var(--color-primary)" />
            <span>Thẻ hành vi cần phân loại ({totalClassified} / {coreCards.length}):</span>
          </div>

          {isComplete && (
            <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={18} /> Đã hoàn thành phân loại!
            </span>
          )}
        </div>

        {/* Card Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          {coreCards.map((card, idx) => {
            const isClassified = Boolean(classifiedCards[card.id]);
            const isSelected = activeCardId === card.id;

            return (
              <button
                key={card.id}
                onClick={() => {
                  setActiveCardId(card.id);
                  setFeedbackMessage(null);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: isSelected ? 'var(--color-primary)' : isClassified ? '#E2E8F0' : '#FFF',
                  color: isSelected ? '#FFF' : isClassified ? '#64748B' : 'var(--color-text-main)',
                  border: isSelected ? 'none' : '1px solid #CBD5E1',
                }}
              >
                {isClassified ? '✓ ' : ''}Thẻ {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Active Card Body */}
        {activeCard ? (
          <div style={{
            background: '#F8FAFC',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid #E2E8F0',
          }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>
              📌 {activeCard.cardTitle}
            </h4>

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
              Hãy chọn 1 trong 3 trụ cột ở trên (bằng cách nhấp trực tiếp vào ô tương ứng) mà bạn cho là thể hiện rõ nhất tính chất văn hóa của hành vi này!
            </p>

            {/* Direct classification buttons for mobile friendliness */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleClassify('danToc')}
                style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: 'var(--radius-sm)', background: '#EF4444', color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}
              >
                🇻🇳 Dân Tộc
              </button>
              <button
                onClick={() => handleClassify('khoaHoc')}
                style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: 'var(--radius-sm)', background: '#3B82F6', color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}
              >
                🔬 Khoa Học
              </button>
              <button
                onClick={() => handleClassify('daiChung')}
                style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: 'var(--radius-sm)', background: '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}
              >
                👥 Đại Chúng
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
            Vui lòng chọn một thẻ ở trên để bắt đầu phân loại.
          </div>
        )}

        {/* Feedback message */}
        {feedbackMessage && (
          <div className="animate-fade-in" style={{
            marginTop: '16px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#EFF6FF',
            borderLeft: '4px solid #3B82F6',
            color: '#1E3A8A',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}>
            {feedbackMessage}
          </div>
        )}
      </div>

      {/* Next Phase CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setPhase('strategy')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(218, 37, 29, 0.3)',
          }}
        >
          <span>CHUYỂN SANG ACT 3: CHIẾN LƯỢC XÂY & CHỐNG</span>
          <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
};
