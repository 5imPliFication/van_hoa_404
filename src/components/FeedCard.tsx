import { useState } from 'react';
import type { Choice, Scenario } from '../types/game';
import { useGameStore } from '../state/gameStore';
import { Heart, MessageSquare, Share2, CheckCircle, ArrowRight } from 'lucide-react';

interface FeedCardProps {
  scenario: Scenario;
}

export const FeedCard: React.FC<FeedCardProps> = ({ scenario }) => {
  const { makeChoice, nextScenario } = useGameStore();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handleSelectChoice = (choice: Choice) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choice.id);
    makeChoice(choice.id);
  };

  const handleContinue = () => {
    setSelectedChoiceId(null);
    nextScenario();
  };

  const selectedChoice = scenario.choices.find((c) => c.id === selectedChoiceId);

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Post Author Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={scenario.author.avatar}
            alt={scenario.author.displayName}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #E2E8F0' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                {scenario.author.displayName}
              </span>
              {scenario.author.badge && (
                <span className="badge badge-primary">{scenario.author.badge}</span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {scenario.author.handle} • 15 phút trước
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(218, 37, 29, 0.08)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          Kịch bản {scenario.order}
        </div>
      </div>

      {/* Content Text */}
      <div style={{ fontSize: '1.05rem', lineHeight: 1.55, marginBottom: '16px', color: '#1E293B', fontWeight: 500 }}>
        {scenario.content.text}
      </div>

      {/* Media Content (if any) */}
      {scenario.content.media && scenario.content.media.type !== 'none' && (
        <div style={{ marginBottom: '18px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          {scenario.content.media.type === 'quote' ? (
            <div style={{ background: '#F8FAFC', padding: '16px', borderLeft: '4px solid var(--color-primary)', fontStyle: 'italic', color: '#475569' }}>
              "{scenario.content.media.caption}"
            </div>
          ) : (
            <div>
              <img
                src={scenario.content.media.src}
                alt={scenario.content.media.alt || 'Media post'}
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
              />
              {scenario.content.media.caption && (
                <div style={{ padding: '8px 12px', background: '#F8FAFC', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  📷 {scenario.content.media.caption}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Social Engagement Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderTop: '1px solid #F1F5F9',
        borderBottom: '1px solid #F1F5F9',
        marginBottom: '20px',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={16} color="#EF4444" /> {scenario.content.engagement.likes.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={16} color="#3B82F6" /> {scenario.content.engagement.comments.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Share2 size={16} color="#10B981" /> {scenario.content.engagement.shares.toLocaleString()}
          </span>
        </div>
        <div style={{ fontStyle: 'italic' }}>📌 Quyết định của bạn mang tính định hướng</div>
      </div>

      {/* Choice Buttons / Feedback */}
      {!selectedChoiceId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            BẠN SẼ HÀNH ĐỘNG THẾ NÀO?
          </div>
          {scenario.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleSelectChoice(choice)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                color: 'var(--color-text-main)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.background = 'rgba(218, 37, 29, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <span>{choice.label}</span>
              <ArrowRight size={16} color="var(--color-primary)" />
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in" style={{
          background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid #3B82F6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#1E40AF', fontWeight: 700 }}>
            <CheckCircle size={20} />
            <span>Phản hồi kết quả hành động</span>
          </div>

          <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1E293B', marginBottom: '16px' }}>
            {selectedChoice?.feedback}
          </div>

          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--color-primary)',
            fontSize: '0.85rem',
            color: '#475569',
            marginBottom: '18px',
          }}>
            <strong>Gợi ý bài học văn hóa:</strong> {scenario.learningMapping.explanation}
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(218, 37, 29, 0.3)',
            }}
          >
            <span>Tiếp tục kịch bản tiếp theo</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
