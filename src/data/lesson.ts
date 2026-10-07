// Lecture-sourced lesson text shown to the player.
// Every quote is taken verbatim from Giáo trình Tư tưởng Hồ Chí Minh, Chương VI
// (see t_t_ng_h_ch_minh_v_x_y_d_ng_n_n_v_n_h_a_m_i.md). Keep it that way: do not paraphrase into quotes.

export const LECTURE_SOURCE = 'Giáo trình Tư tưởng Hồ Chí Minh, Chương VI';

export const CORE_PRINCIPLE = {
  heading: 'ĐỀ CƯƠNG VĂN HÓA VIỆT NAM (1943)',
  intro: 'Hồ Chí Minh khẳng định phương châm xây dựng nền văn hóa mới có tính chất:',
};

export interface CorePillarLesson {
  icon: string;
  label: string;
  meaning: string;
  inGame: string;
}

export const CORE_PILLAR_LESSONS: CorePillarLesson[] = [
  {
    icon: '🇻🇳',
    label: 'DÂN TỘC',
    meaning: 'Giữ gìn cốt cách văn hóa dân tộc, lấy văn hóa dân tộc làm gốc',
    inGame: 'Trong game: Khiên & Máu — gốc rễ giữ bạn đứng vững',
  },
  {
    icon: '🔬',
    label: 'KHOA HỌC',
    meaning: 'Chống giặc dốt, phát triển văn hóa, nâng cao dân trí',
    inGame: 'Trong game: Tốc bắn & Chí mạng — hiểu biết giúp phản biện sắc bén',
  },
  {
    icon: '👥',
    label: 'ĐẠI CHÚNG',
    meaning: '"Từ trong quần chúng ra. Về sâu trong quần chúng"',
    inGame: 'Trong game: Hào quang & Tầm hút — văn hóa lan tỏa tới mọi người',
  },
];

export const SUMMARY_QUOTE =
  'Một nền văn hóa toàn diện, giữ gìn được cốt cách văn hóa dân tộc, bảo đảm tính khoa học, tiến bộ và nhân văn.';

// Section (b): "Giữ gìn bản sắc và tiếp thu tinh hoa văn hóa nhân loại" (tr.121-122)
export const TINH_HOA = {
  learnQuote: 'Có cái gì hay, cái gì tốt là ta học lấy.',
  rootQuote: 'Phải lấy văn hóa dân tộc làm gốc, đó là điều kiện, cơ sở để tiếp thu văn hóa nhân loại.',
  page: 'tr.122',
  requiredDanToc: 2,
  maxStacks: 3,
  minPlayerLevel: 3,
};

export const ARCHETYPE_QUOTES: Record<string, { quote: string; source: string }> = {
  'Người Kiểm Chứng': {
    quote: 'Cả cuộc đời Người chú trọng chống giặc dốt, phát triển văn hóa, nâng cao dân trí.',
    source: `${LECTURE_SOURCE}, tr.120`,
  },
  'Người Kiến Tạo': {
    quote: 'Văn hóa phải làm thế nào cho mọi người dân Việt Nam, từ già đến trẻ, cả đàn ông và đàn bà, ai cũng hiểu nhiệm vụ của mình và biết hưởng hạnh phúc mà mình nên được hưởng.',
    source: `${LECTURE_SOURCE}, tr.120`,
  },
  'Người Gìn Giữ': {
    quote: TINH_HOA.rootQuote,
    source: `${LECTURE_SOURCE}, tr.122`,
  },
  'Người Kết Nối': {
    quote: 'Mọi hoạt động văn hóa phải trở về với cuộc sống thực tại của quần chúng, phản ánh được tư tưởng và khát vọng của quần chúng.',
    source: `${LECTURE_SOURCE}, tr.125`,
  },
  'Người Phản Biện': {
    quote: 'Văn hóa là một mặt trận.',
    source: 'Nghị quyết Trung ương 5 khóa VIII (1998), trích trong Giáo trình, tr.143',
  },
};

// One-line meaning shown on each pillar's upgrade card. Phrases in quotes come from the lecture.
export const PILLAR_MEANINGS: Record<string, string> = {
  danToc: '“Lấy văn hóa dân tộc làm gốc”',
  khoaHoc: '“Chống giặc dốt, nâng cao dân trí”',
  daiChung: '“Từ trong quần chúng ra, về sâu trong quần chúng”',
  chan: 'Tôn trọng sự thật, kiểm chứng trước khi tin',
  thien: 'Ứng xử tử tế, nhân văn với mọi người',
  my: 'Sáng tạo cái đẹp, không chạy theo “phù hoa”',
  build: 'Xây: vun đắp giá trị tích cực cho cộng đồng',
  fight: 'Chống: “Văn hóa là một mặt trận”',
};

export const PILLAR_LABELS: Record<string, string> = {
  danToc: '🇻🇳 Dân tộc',
  khoaHoc: '🔬 Khoa học',
  daiChung: '👥 Đại chúng',
  chan: '⚖️ Chân',
  thien: '❤️ Thiện',
  my: '🎨 Mỹ',
  build: '🏗️ Xây',
  fight: '⚔️ Chống',
};

// Shown once per run, the first time each phenomenon appears. Describes what the enemy stands for.
export const ENEMY_LESSONS: Record<string, string> = {
  clickbait: 'Giật tít, hào nhoáng để câu view — kiểu “phù hoa” mà văn hóa phải sửa đổi',
  tinGia: 'Thông tin sai lệch lan nhanh — “giặc dốt” thời số, đẩy lùi bằng hiểu biết',
  tamLyDamDong: 'A dua theo đám đông, không tự suy xét đúng sai',
  baoLucNgonTu: 'Lời lẽ miệt thị, công kích người khác trên mạng',
  daoNhai: 'Sao chép máy móc, thiếu sáng tạo và bản sắc riêng',
  xuyenTacVanHoa: 'Bóp méo, xuyên tạc giá trị văn hóa dân tộc',
  cucDoanMang: 'Quan điểm cực đoan, kích động thù ghét và chia rẽ',
  khungHoangTruyenThong: 'Khủng hoảng thông tin khiến cộng đồng hoang mang',
};
