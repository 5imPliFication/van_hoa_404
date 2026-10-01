export type Phase =
  | 'landing'
  | 'setup'
  | 'feed'
  | 'core'
  | 'strategy'
  | 'timeline'
  | 'result'
  | 'sources';

export type CoreType = 'danToc' | 'khoaHoc' | 'daiChung';
export type ValueType = 'chan' | 'thien' | 'my';

export interface ScoreState {
  danToc: number;
  khoaHoc: number;
  daiChung: number;

  chan: number;
  thien: number;
  my: number;

  build: number;
  fight: number;

  trust: number;
  communityHealth: number;
  criticalThinking: number;

  viralRisk: number;
}

export interface PlayerInfo {
  nickname: string;
  avatarId: string;
  groupCode?: string;
}

export interface Author {
  displayName: string;
  handle: string;
  avatar: string;
  badge?: string;
}

export interface Media {
  type: 'image' | 'video' | 'news' | 'quote' | 'none';
  src?: string;
  alt?: string;
  caption?: string;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
}

export interface Choice {
  id: string;
  label: string;
  actionType?: 'share' | 'ignore' | 'verify' | 'report' | 'comment' | 'reframe' | 'support';
  feedback: string;
  scoreDelta: Partial<ScoreState>;
  setFlags?: Record<string, boolean>;
  queueConsequences?: string[];
}

export interface DelayedConsequenceTrigger {
  requiredFlags?: string[];
  minScenarioIndex?: number;
}

export interface DelayedConsequence {
  id: string;
  trigger: DelayedConsequenceTrigger;
  type: 'toast' | 'breaking_news' | 'feed_followup' | 'community_impact';
  title: string;
  message: string;
  scoreDelta?: Partial<ScoreState>;
}

export interface CoreClassificationData {
  enabled: boolean;
  cardTitle: string;
  validCores: CoreType[];
  explanation: string;
}

export interface Scenario {
  id: string;
  enabled: boolean;
  phase: 'feed';
  order: number;
  title: string;
  contentType: 'post' | 'article' | 'video' | 'story' | 'comment';
  author: Author;
  content: {
    text: string;
    media?: Media;
    engagement: Engagement;
  };
  tags: string[];
  learningMapping: {
    cores: CoreType[];
    values: ValueType[];
    theme: string;
    explanation: string;
  };
  choices: Choice[];
  delayedConsequences?: DelayedConsequence[];
  coreClassification: CoreClassificationData;
}

export interface StrategyCard {
  id: string;
  title: string;
  description: string;
  category: 'build' | 'fight' | 'balanced';
  cost: number;
  buildDelta: number;
  fightDelta: number;
  trustDelta: number;
  communityHealthDelta: number;
  cultureTags: string[];
}

export interface Archetype {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  advice: string;
  minRequirements?: Partial<ScoreState>;
}

export interface ChoiceHistoryItem {
  scenarioId: string;
  scenarioTitle: string;
  choiceId: string;
  choiceLabel: string;
  feedback: string;
  timestamp: string;
  scoreSnapshot: ScoreState;
}

export interface ConsequenceHistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'positive' | 'warning' | 'info' | 'consequence';
  durationMs?: number;
}
