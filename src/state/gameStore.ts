import { create } from 'zustand';
import type {
  ChoiceHistoryItem,
  ConsequenceHistoryItem,
  CoreType,
  DelayedConsequence,
  Phase,
  PlayerInfo,
  Scenario,
  ScoreState,
  StrategyCard,
  ToastNotification,
} from '../types/game';
import { applyScoreDelta, INITIAL_SCORES } from '../engine/scoring';
import { evaluateDelayedConsequences } from '../engine/consequenceEngine';
import { soundManager } from '../utils/audio';

interface GameStore {
  // Phase & Player
  phase: Phase;
  player: PlayerInfo;

  // State & Scores
  scores: ScoreState;
  flags: Record<string, boolean>;

  // Scenario Progress
  scenarios: Scenario[];
  currentScenarioIndex: number;

  // History & Consequences
  choiceHistory: ChoiceHistoryItem[];
  consequenceHistory: ConsequenceHistoryItem[];
  unlockedConsequences: string[];
  toasts: ToastNotification[];

  // Core Classification (Act 2)
  classifiedCards: Record<string, CoreType>;

  // Strategy Selection (Act 3)
  selectedStrategies: StrategyCard[];
  actionPointsRemaining: number;

  // Audio Settings
  soundEnabled: boolean;

  // Actions
  setPhase: (phase: Phase) => void;
  setPlayer: (player: PlayerInfo) => void;
  loadScenarios: (scenarios: Scenario[]) => void;
  makeChoice: (choiceId: string) => void;
  nextScenario: () => void;
  classifyCard: (cardId: string, core: CoreType) => void;
  toggleStrategy: (card: StrategyCard) => void;
  confirmStrategies: () => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;
  toggleSound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'landing',
  player: {
    nickname: 'Người dùng 404',
    avatarId: 'avatar_1',
  },
  scores: { ...INITIAL_SCORES },
  flags: {},

  scenarios: [],
  currentScenarioIndex: 0,

  choiceHistory: [],
  consequenceHistory: [],
  unlockedConsequences: [],
  toasts: [],

  classifiedCards: {},

  selectedStrategies: [],
  actionPointsRemaining: 5,

  soundEnabled: true,

  setPhase: (phase) => {
    soundManager.playClick();
    set({ phase });
  },

  setPlayer: (player) => set({ player }),

  loadScenarios: (scenarios) => set({ scenarios, currentScenarioIndex: 0 }),

  makeChoice: (choiceId) => {
    const { scenarios, currentScenarioIndex, scores, flags, choiceHistory, unlockedConsequences, consequenceHistory } = get();
    const currentScenario = scenarios[currentScenarioIndex];
    if (!currentScenario) return;

    const choice = currentScenario.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    soundManager.playClick();

    // Update scores
    const newScores = applyScoreDelta(scores, choice.scoreDelta);

    // Update flags
    const newFlags = { ...flags, ...(choice.setFlags || {}) };

    // Record choice history
    const historyItem: ChoiceHistoryItem = {
      scenarioId: currentScenario.id,
      scenarioTitle: currentScenario.title,
      choiceId: choice.id,
      choiceLabel: choice.label,
      feedback: choice.feedback,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      scoreSnapshot: newScores,
    };

    // Evaluate delayed consequences
    const triggered = evaluateDelayedConsequences(
      currentScenario,
      currentScenarioIndex,
      newFlags,
      unlockedConsequences
    );

    const newUnlocked = [...unlockedConsequences];
    const newConsequenceHistory = [...consequenceHistory];
    const newToasts: ToastNotification[] = [];

    triggered.forEach((consequence: DelayedConsequence) => {
      newUnlocked.push(consequence.id);
      newConsequenceHistory.push({
        id: consequence.id,
        title: consequence.title,
        message: consequence.message,
        type: consequence.type,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });

      newToasts.push({
        id: `toast_${Date.now()}_${consequence.id}`,
        title: consequence.title,
        message: consequence.message,
        type: consequence.type === 'toast' ? 'info' : 'consequence',
      });

      // Sound trigger
      soundManager.playNotification();

      // Apply consequence score delta if present
      if (consequence.scoreDelta) {
        Object.assign(newScores, applyScoreDelta(newScores, consequence.scoreDelta));
      }
    });

    // Add choice micro-feedback toast
    const feedbackToast: ToastNotification = {
      id: `toast_${Date.now()}_feedback`,
      title: choice.label,
      message: choice.feedback,
      type: 'positive',
    };

    set({
      scores: newScores,
      flags: newFlags,
      choiceHistory: [...choiceHistory, historyItem],
      unlockedConsequences: newUnlocked,
      consequenceHistory: newConsequenceHistory,
      toasts: [...get().toasts, feedbackToast, ...newToasts],
    });
  },

  nextScenario: () => {
    const { currentScenarioIndex, scenarios } = get();
    if (currentScenarioIndex + 1 < scenarios.length) {
      set({ currentScenarioIndex: currentScenarioIndex + 1 });
    } else {
      // Feed phase complete, move to Act 2 Core classification
      soundManager.playPositive();
      set({ phase: 'core' });
    }
  },

  classifyCard: (cardId, core) => {
    soundManager.playClick();
    set((state) => ({
      classifiedCards: { ...state.classifiedCards, [cardId]: core },
    }));
  },

  toggleStrategy: (card) => {
    const { selectedStrategies, actionPointsRemaining } = get();
    const exists = selectedStrategies.some((s) => s.id === card.id);

    if (exists) {
      soundManager.playClick();
      set({
        selectedStrategies: selectedStrategies.filter((s) => s.id !== card.id),
        actionPointsRemaining: actionPointsRemaining + card.cost,
      });
    } else {
      if (actionPointsRemaining >= card.cost) {
        soundManager.playClick();
        set({
          selectedStrategies: [...selectedStrategies, card],
          actionPointsRemaining: actionPointsRemaining - card.cost,
        });
      } else {
        soundManager.playWarning();
      }
    }
  },

  confirmStrategies: () => {
    const { selectedStrategies, scores } = get();
    let updatedScores = { ...scores };

    selectedStrategies.forEach((card) => {
      updatedScores = applyScoreDelta(updatedScores, {
        build: card.buildDelta,
        fight: card.fightDelta,
        trust: card.trustDelta,
        communityHealth: card.communityHealthDelta,
      });
    });

    soundManager.playFanfare();
    set({ scores: updatedScores, phase: 'timeline' });
  },

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleSound: () => {
    const enabled = soundManager.toggleSound();
    set({ soundEnabled: enabled });
  },

  resetGame: () => {
    soundManager.playClick();
    set({
      phase: 'landing',
      scores: { ...INITIAL_SCORES },
      flags: {},
      currentScenarioIndex: 0,
      choiceHistory: [],
      consequenceHistory: [],
      unlockedConsequences: [],
      toasts: [],
      classifiedCards: {},
      selectedStrategies: [],
      actionPointsRemaining: 5,
    });
  },
}));
