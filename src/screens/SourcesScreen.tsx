import React from 'react';
import { useGameStore } from '../state/gameStore';
import rawEndings from '../data/endings.json';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const SourcesScreen: React.FC = () => {
  const { setPhase } = useGameStore();

  return (
    <div style={{ maxWidth: '780px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">

      <button
        onClick={() => setPhase('landing')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={18} />
        <span>Quay lại trang chủ</span>
      </button>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen color="var(--color-primary)" size={28} />
          <span>Nguồn Học Liệu & Cơ Sở Lý Luận</span>
        </h2>

        <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
          Game tương tác <strong>VĂN HÓA 404</strong> được chuyển thể từ nội dung môn học Tư tưởng Hồ Chí Minh, trọng tâm là chương <i>"Tư tưởng Hồ Chí Minh về văn hóa và việc xây dựng nền văn hóa mới ở Việt Nam"</i>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {rawEndings.references.map((ref, idx) => (
            <div
              key={idx}
              style={{
                background: '#F8FAFC',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--color-primary)',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                📌 {ref.title}
              </h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                {ref.author}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
                {ref.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#F1F5F9',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748B',
      }}>
        <div>SPST HCM202 - FPT University</div>
        <div>Được thiết kế phục vụ học tập tương tác sáng tạo cho sinh viên.</div>
      </div>

    </div>
  );
};
