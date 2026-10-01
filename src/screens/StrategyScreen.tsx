import React from 'react';
import { useGameStore } from '../state/gameStore';
import rawStrategies from '../data/strategies.json';
import type { StrategyCard } from '../types/game';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { calculateBalanceScore } from '../engine/scoring';

export const StrategyScreen: React.FC = () => {
  const {
    selectedStrategies,
    actionPointsRemaining,
    toggleStrategy,
    confirmStrategies,
    scores,
  } = useGameStore();

  const strategies = rawStrategies as unknown as StrategyCard[];

  // Calculate score preview
  let buildDeltaSum = 0;
  let fightDeltaSum = 0;
  selectedStrategies.forEach((s) => {
    buildDeltaSum += s.buildDelta;
    fightDeltaSum += s.fightDelta;
  });

  const previewBuild = Math.min(100, scores.build + buildDeltaSum);
  const previewFight = Math.min(100, scores.fight + fightDeltaSum);
  const previewBalance = calculateBalanceScore(previewBuild, previewFight);

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">

      {/* Screen Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '8px' }}>ACT 3: CHIẾN LƯỢC XÂY & CHỐNG</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Phân Bổ Nguồn Lực Chiến Lược Văn Hóa
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '6px auto 0' }}>
          Nguyên tắc: <strong>"Xây đi đôi với Chống"</strong>. Đẩy mạnh việc "Xây" nội dung hay song song với "Chống" các hành vi vi phạm độc hại.
        </p>
      </div>

      {/* AP Counter & Live Balance Preview Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--color-gold)',
            color: '#1E293B',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(255, 184, 0, 0.4)',
          }}>
            <Zap size={24} fill="#1E293B" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>ĐIỂM HÀNH ĐỘNG DỰ DƯƠNG</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {actionPointsRemaining} / 5 AP
            </div>
          </div>
        </div>

        {/* Live Metrics Preview */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', display: 'block' }}>🌱 NỀN TẢNG XÂY</span>
            <strong style={{ fontSize: '1.2rem', color: '#15803D' }}>{previewBuild}</strong>
            {buildDeltaSum > 0 && <span style={{ fontSize: '0.8rem', color: '#16A34A' }}> (+{buildDeltaSum})</span>}
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', display: 'block' }}>🛡️ NỀN TẢNG CHỐNG</span>
            <strong style={{ fontSize: '1.2rem', color: '#B91C1C' }}>{previewFight}</strong>
            {fightDeltaSum > 0 && <span style={{ fontSize: '0.8rem', color: '#DC2626' }}> (+{fightDeltaSum})</span>}
          </div>

          <div style={{ textAlign: 'center', borderLeft: '2px solid #E2E8F0', paddingLeft: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>⚖️ ĐỘ CÂN BẰNG</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{previewBalance}%</strong>
          </div>
        </div>

      </div>

      {/* Strategy Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {strategies.map((card) => {
          const isSelected = selectedStrategies.some((s) => s.id === card.id);
          const isAffordable = actionPointsRemaining >= card.cost || isSelected;

          return (
            <div
              key={card.id}
              onClick={() => toggleStrategy(card)}
              style={{
                background: isSelected ? 'rgba(218, 37, 29, 0.04)' : '#FFFFFF',
                border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                cursor: isAffordable ? 'pointer' : 'not-allowed',
                opacity: isAffordable ? 1 : 0.6,
                boxShadow: isSelected ? '0 8px 20px rgba(218, 37, 29, 0.15)' : 'var(--shadow-sm)',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Category Badge & Cost */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className={`badge ${card.category === 'build' ? 'badge-success' : card.category === 'fight' ? 'badge-primary' : 'badge-gold'}`}>
                  {card.category === 'build' ? '🌱 Ưu tiên Xây' : card.category === 'fight' ? '🛡️ Ưu tiên Chống' : '⚖️ Hài hòa'}
                </span>

                <span style={{
                  background: '#F1F5F9',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                }}>
                  {card.cost} AP
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>
                {card.title}
              </h4>

              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, marginBottom: '14px' }}>
                {card.description}
              </p>

              {/* Selection Checkmark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                  {card.buildDelta > 0 ? `+${card.buildDelta} Xây ` : ''}
                  {card.fightDelta > 0 ? `+${card.fightDelta} Chống` : ''}
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--color-primary)' : '#E2E8F0',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Action CTA */}
      <div>
        <button
          onClick={confirmStrategies}
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
          <span>THỰC THI CHIẾN LƯỢC & XEM DÒNG THỜI GIAN</span>
          <ArrowRight size={22} />
        </button>
      </div>

    </div>
  );
};
