import React, { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { FeedCard } from '../components/FeedCard';
import rawScenarios from '../data/scenarios.json';
import type { Scenario } from '../types/game';

export const FeedScreen: React.FC = () => {
  const { scenarios, loadScenarios, currentScenarioIndex } = useGameStore();

  useEffect(() => {
    if (scenarios.length === 0) {
      loadScenarios(rawScenarios as unknown as Scenario[]);
    }
  }, [scenarios.length, loadScenarios]);

  if (scenarios.length === 0) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải kịch bản mạng xã hội...</div>;
  }

  const currentScenario = scenarios[currentScenarioIndex];
  const progressPercent = Math.round(((currentScenarioIndex + 1) / scenarios.length) * 100);

  return (
    <div style={{ maxWidth: '680px', margin: '24px auto', padding: '0 20px' }}>

      {/* Progress Bar & Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
          <span>KỊCH BẢN {currentScenarioIndex + 1} / {scenarios.length}</span>
          <span>{progressPercent}% HOÀN THÀNH</span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #DA251D, #FFB800)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Active Feed Scenario Card */}
      {currentScenario && <FeedCard scenario={currentScenario} />}

    </div>
  );
};
