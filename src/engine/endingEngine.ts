import type { Archetype, ScoreState } from '../types/game';
import { calculateBalanceScore, calculateCulturalEffectiveness } from './scoring';

export const ARCHETYPES: Archetype[] = [
  {
    id: 'verifier',
    title: 'Người kiểm chứng',
    badge: '🔍',
    tagline: 'Sắc bén – Tinh tế – Khoa học',
    description:
      'Bạn là lá chắn thông tin sắc bén trên không gian mạng. Trước mọi tin đồn hay xu hướng, bạn luôn giữ cái đầu lạnh, kiểm chứng nguồn tin và bảo vệ sự thật.',
    advice:
      'Tư duy phản biện của bạn rất xuất sắc. Hãy chủ động sáng tạo thêm nội dung tích cực để lan tỏa năng lượng tốt đẹp bên cạnh việc kiểm chứng.',
  },
  {
    id: 'builder',
    title: 'Người kiến tạo',
    badge: '🌟',
    tagline: 'Chủ động – Sáng tạo – Xây dựng',
    description:
      'Bạn tin rằng cách tốt nhất để đẩy lùi cái xấu là gieo mầm cái đẹp. Bạn luôn ưu tiên sáng tạo nội dung văn hóa có giá trị, nhân văn và mang lại cảm hứng.',
    advice:
      'Tinh thần "Xây" của bạn là động lực lớn cho cộng đồng. Đừng quên rèn luyện thêm kỹ năng nhận diện và kiên quyết phản bác các hành vi xâm phạm văn hóa.',
  },
  {
    id: 'guardian',
    title: 'Người gìn giữ',
    badge: '🇻🇳',
    tagline: 'Tôn vinh – Trân trọng – Bản sắc',
    description:
      'Bạn trân trọng từng nét đẹp truyền thống và bản sắc dân tộc. Bạn nhạy bén với các nội dung xuyên tạc lịch sử và luôn bảo vệ giá trị di sản văn hóa Việt Nam.',
    advice:
      'Lòng yêu văn hóa dân tộc của bạn rất đáng quý. Hãy tiếp tục kết hợp tinh thần truyền thống với tư duy hiện đại, cởi mở để văn hóa Việt hòa nhập mà không hòa tan.',
  },
  {
    id: 'connector',
    title: 'Người kết nối',
    badge: '🤝',
    tagline: 'Bao dung – Kết nối – Vì đại chúng',
    description:
      'Bạn luôn hướng về lợi ích cộng đồng, ưu tiên lối ứng xử hòa nhã, tôn trọng người khác và tạo dựng môi trường mạng lành mạnh cho tất cả mọi người.',
    advice:
      'Sự hòa nhã của bạn kết nối mọi người. Hãy tăng cường trang bị các phương pháp kiểm chứng thông tin để bảo vệ cộng đồng khỏi tin giả một cách khoa học.',
  },
  {
    id: 'defender',
    title: 'Người phản biện',
    badge: '🛡️',
    tagline: 'Dũng cảm – Công minh – Trừ tà',
    description:
      'Bạn không ngần ngại lên tiếng trước các hành vi xấu, công kích cá nhân hay lừa đảo mạng. Bạn coi không gian mạng là một mặt trận văn hóa cần được bảo vệ.',
    advice:
      'Tinh thần "Chống" dũng cảm của bạn giúp giữ vững kỷ cương mạng. Hãy kết hợp thêm giải pháp "Xây" nội dung hay để đạt sự cân bằng tối ưu.',
  },
  {
    id: 'spreader',
    title: 'Người lan tỏa',
    badge: '🚀',
    tagline: 'Toàn diện – Hài hòa – Truyền cảm hứng',
    description:
      'Bạn đạt được sự cân bằng xuất sắc giữa Dân tộc – Khoa học – Đại chúng. Lựa chọn của bạn vừa có lý, vừa có tình, truyền cảm hứng tích cực rộng khắp.',
    advice:
      'Bạn là hình mẫu Công dân văn hóa số tiêu biểu! Hãy tiếp tục phát huy và dẫn dắt các chiến dịch văn hóa số lành mạnh trong cộng đồng.',
  },
];

export function determineArchetype(scores: ScoreState): Archetype {
  const { khoaHoc, criticalThinking, build, communityHealth, danToc, my, daiChung, thien, fight, chan } = scores;

  // Score matching priority logic
  if (khoaHoc >= 70 && criticalThinking >= 65) {
    return ARCHETYPES.find((a) => a.id === 'verifier')!;
  }
  if (build >= 70 && communityHealth >= 65) {
    return ARCHETYPES.find((a) => a.id === 'builder')!;
  }
  if (danToc >= 70 && my >= 60) {
    return ARCHETYPES.find((a) => a.id === 'guardian')!;
  }
  if (daiChung >= 70 && thien >= 65) {
    return ARCHETYPES.find((a) => a.id === 'connector')!;
  }
  if (fight >= 70 && chan >= 65) {
    return ARCHETYPES.find((a) => a.id === 'defender')!;
  }

  // Default to spreader or highest trait
  return ARCHETYPES.find((a) => a.id === 'spreader')!;
}

export function generateFinalSummary(scores: ScoreState) {
  const archetype = determineArchetype(scores);
  const balanceScore = calculateBalanceScore(scores.build, scores.fight);
  const culturalEffectiveness = calculateCulturalEffectiveness(scores);

  return {
    archetype,
    balanceScore,
    culturalEffectiveness,
    metrics: [
      { label: 'Dân tộc', score: scores.danToc, color: '#DA251D', icon: '🇻🇳' },
      { label: 'Khoa học', score: scores.khoaHoc, color: '#0066FF', icon: '🔬' },
      { label: 'Đại chúng', score: scores.daiChung, color: '#10B981', icon: '👥' },
      { label: 'Chân', score: scores.chan, color: '#8B5CF6', icon: '💎' },
      { label: 'Thiện', score: scores.thien, color: '#EC4899', icon: '❤️' },
      { label: 'Mỹ', score: scores.my, color: '#F59E0B', icon: '🎨' },
      { label: 'Nền tảng Xây', score: scores.build, color: '#22C55E', icon: '🌱' },
      { label: 'Nền tảng Chống', score: scores.fight, color: '#EF4444', icon: '🛡️' },
      { label: 'Sức khỏe Cộng đồng', score: scores.communityHealth, color: '#14B8A6', icon: '🏥' },
    ],
  };
}
