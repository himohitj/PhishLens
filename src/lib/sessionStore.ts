import {
  JourneyStage,
  SessionStateResponse,
  AssessmentSummary,
  SimulationFeedbackRecord,
  PublicQuestion,
  PublicScenario,
  LearningModule,
  AttackCategory,
} from '../types/phishlens.ts';
import {
  BASELINE_QUESTIONS,
  FINAL_QUESTIONS,
  SCENARIOS,
  LEARNING_MODULES,
  getPublicQuestions,
  getPublicScenarios,
} from '../server/data.ts';

const STORAGE_KEY = 'phishlens_visitor_session_v1';

/**
 * Generates a high-entropy cryptographically secure opaque session token
 * using the browser Web Crypto API.
 */
function generateSecureSessionToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `pl_sess_${hex}`;
}

function createFreshSession(): SessionStateResponse {
  return {
    sessionId: generateSecureSessionToken(),
    currentStage: 'landing',
    startedAt: new Date().toISOString(),
    completedAt: null,
    baselineAssessment: null,
    finalAssessment: null,
    completedScenarioIds: [],
    simulationFeedbacks: {},
    inspectedEvidenceByScenario: {},
    roomTaskProgress: {},
    completedModuleSlugs: [],
  };
}

export class SessionStorageAdapter {
  static loadSession(): SessionStateResponse {
    if (typeof window === 'undefined') {
      return createFreshSession();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = createFreshSession();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      const parsed = JSON.parse(raw) as Partial<SessionStateResponse>;
      if (!parsed || typeof parsed.sessionId !== 'string' || !parsed.sessionId.startsWith('pl_sess_')) {
        const fresh = createFreshSession();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return {
        sessionId: parsed.sessionId,
        currentStage: parsed.currentStage || 'landing',
        startedAt: parsed.startedAt || new Date().toISOString(),
        completedAt: parsed.completedAt || null,
        baselineAssessment: parsed.baselineAssessment || null,
        finalAssessment: parsed.finalAssessment || null,
        completedScenarioIds: Array.isArray(parsed.completedScenarioIds) ? parsed.completedScenarioIds : [],
        simulationFeedbacks: parsed.simulationFeedbacks || {},
        inspectedEvidenceByScenario: parsed.inspectedEvidenceByScenario || {},
        roomTaskProgress: parsed.roomTaskProgress || {},
        completedModuleSlugs: Array.isArray(parsed.completedModuleSlugs) ? parsed.completedModuleSlugs : [],
      };
    } catch {
      const fresh = createFreshSession();
      return fresh;
    }
  }

  static saveSession(session: SessionStateResponse): SessionStateResponse {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error('Failed to persist session to localStorage:', e);
      }
    }
    return session;
  }

  static resetSession(): SessionStateResponse {
    const fresh = createFreshSession();
    return this.saveSession(fresh);
  }

  static updateStage(stage: JourneyStage): SessionStateResponse {
    const current = this.loadSession();
    const updated: SessionStateResponse = {
      ...current,
      currentStage: stage,
      completedAt: stage === 'report' && !current.completedAt ? new Date().toISOString() : current.completedAt,
    };
    return this.saveSession(updated);
  }

  static recordEvidenceInspection(scenarioId: string, evidenceId: string): SessionStateResponse {
    const current = this.loadSession();
    const existingList = current.inspectedEvidenceByScenario[scenarioId] || [];
    const nextList = existingList.includes(evidenceId) ? existingList : [...existingList, evidenceId];
    const updated: SessionStateResponse = {
      ...current,
      inspectedEvidenceByScenario: {
        ...current.inspectedEvidenceByScenario,
        [scenarioId]: nextList,
      },
    };
    return this.saveSession(updated);
  }

  static updateRoomTaskProgress(scenarioId: string, stepIndex: number): SessionStateResponse {
    const current = this.loadSession();
    const updated: SessionStateResponse = {
      ...current,
      roomTaskProgress: {
        ...current.roomTaskProgress,
        [scenarioId]: stepIndex,
      },
    };
    return this.saveSession(updated);
  }

  static saveAssessmentResult(summary: AssessmentSummary): SessionStateResponse {
    const current = this.loadSession();
    const updated: SessionStateResponse = {
      ...current,
      baselineAssessment: summary.type === 'baseline' ? summary : current.baselineAssessment,
      finalAssessment: summary.type === 'final' ? summary : current.finalAssessment,
      currentStage: summary.type === 'baseline' ? 'simulations' : 'report',
      completedAt: summary.type === 'final' ? new Date().toISOString() : current.completedAt,
    };
    return this.saveSession(updated);
  }

  static saveSimulationFeedback(feedback: SimulationFeedbackRecord): SessionStateResponse {
    const current = this.loadSession();
    const completedIds = current.completedScenarioIds.includes(feedback.scenarioId)
      ? current.completedScenarioIds
      : [...current.completedScenarioIds, feedback.scenarioId];

    const allDone = completedIds.length >= 5;
    const nextStage: JourneyStage =
      allDone && current.currentStage === 'simulations' ? 'learning' : current.currentStage;

    const updated: SessionStateResponse = {
      ...current,
      completedScenarioIds: completedIds,
      simulationFeedbacks: {
        ...current.simulationFeedbacks,
        [feedback.scenarioId]: feedback,
      },
      currentStage: nextStage,
    };
    return this.saveSession(updated);
  }

  static markModuleCompleted(slug: string): SessionStateResponse {
    const current = this.loadSession();
    const completed = current.completedModuleSlugs.includes(slug)
      ? current.completedModuleSlugs
      : [...current.completedModuleSlugs, slug];
    const updated: SessionStateResponse = {
      ...current,
      completedModuleSlugs: completed,
    };
    return this.saveSession(updated);
  }
}

/**
 * Platform-agnostic data & evaluation functions.
 * Executes directly against local structured definitions so the app works identically
 * on static hosts (Vercel, Netlify, Cloudflare Pages) and full-stack Node servers.
 */
export function getLearningModulesSync(): LearningModule[] {
  return LEARNING_MODULES;
}

export async function fetchPublicQuestions(type: 'baseline' | 'final'): Promise<PublicQuestion[]> {
  return getPublicQuestions(type);
}

export async function fetchPublicScenarios(): Promise<PublicScenario[]> {
  return getPublicScenarios();
}

export async function fetchLearningModules(): Promise<LearningModule[]> {
  return LEARNING_MODULES;
}

export async function evaluateAssessmentOnServer(payload: {
  type: 'baseline' | 'final';
  timeTakenSeconds: number;
  answers: Record<string, string>;
}): Promise<AssessmentSummary> {
  const { type, timeTakenSeconds, answers } = payload;
  const questions = type === 'baseline' ? BASELINE_QUESTIONS : FINAL_QUESTIONS;

  let score = 0;
  const categoryStats: Record<
    AttackCategory,
    { category: AttackCategory; categoryLabel: string; correct: number; total: number }
  > = {} as Record<
    AttackCategory,
    { category: AttackCategory; categoryLabel: string; correct: number; total: number }
  >;

  const questionResults = questions.map((q) => {
    const selectedOptionId = answers[q.id] || '';
    const isCorrect = selectedOptionId === q.internalCorrectOptionId;
    if (isCorrect) score += 1;

    if (!categoryStats[q.category]) {
      categoryStats[q.category] = {
        category: q.category,
        categoryLabel: q.categoryLabel,
        correct: 0,
        total: 0,
      };
    }
    categoryStats[q.category].total += 1;
    if (isCorrect) categoryStats[q.category].correct += 1;

    const selectedOpt = q.options.find((o) => o.id === selectedOptionId);
    const correctOpt = q.options.find((o) => o.id === q.internalCorrectOptionId);

    return {
      questionId: q.id,
      number: q.number,
      category: q.category,
      categoryLabel: q.categoryLabel,
      prompt: q.prompt,
      selectedOptionId,
      selectedOptionLabel: selectedOpt ? selectedOpt.label : 'No answer selected',
      correctOptionLabel: correctOpt ? correctOpt.label : '',
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  return {
    type,
    score,
    totalQuestions,
    percentage,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
    categoryBreakdown: Object.values(categoryStats),
    questionResults: type === 'final' ? questionResults : undefined,
  };
}

export function evaluateSimulationDecisionSync(payload: {
  scenarioId: string;
  actionId: string;
  inspectedEvidenceIds: string[];
}): SimulationFeedbackRecord {
  const { scenarioId, actionId, inspectedEvidenceIds } = payload;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  const actionOption =
    scenario.actions.find((a) => a.id === actionId) || scenario.actions[0];
  const scoring =
    scenario.internalScoringData.actionScores[actionOption.id] ||
    Object.values(scenario.internalScoringData.actionScores)[0];

  const uniqueInspected = Array.from(
    new Set(
      inspectedEvidenceIds.filter((id) =>
        scenario.evidenceHotspots.some((h) => h.id === id)
      )
    )
  );

  const inspectedBonusEarned = uniqueInspected.length >= 2 && scoring.score > 0;
  const finalScore = Math.min(100, scoring.score + (inspectedBonusEarned ? 5 : 0));

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    attackType: scenario.attackType,
    attackTypeLabel: scenario.attackTypeLabel,
    selectedActionId: actionOption.id,
    selectedActionLabel: actionOption.label,
    outcomeClassification: scoring.classification,
    resultHeadline: scoring.resultHeadline,
    scoreEarned: finalScore,
    maxScore: 100,
    inspectedEvidenceIds: uniqueInspected,
    inspectedBonusEarned,
    actionExplanation: scoring.actionExplanation,
    safestActionLabel: scenario.internalScoringData.safestActionLabel,
    safestActionRationale: scenario.internalScoringData.safestActionRationale,
    missedOrSpottedEvidence: scenario.evidenceHotspots.map((spot) => ({
      id: spot.id,
      label: spot.label,
      rawValue: spot.rawValue,
      wasInspected: uniqueInspected.includes(spot.id),
      explanation: `${spot.findingTitle}: ${spot.findingDetail}`,
    })),
    attackMechanics: scenario.internalScoringData.attackMechanics,
    realWorldConsequence: scenario.internalScoringData.realWorldConsequence,
    preventionTip: scenario.internalScoringData.preventionTip,
    relatedModuleSlug: scenario.relatedModuleSlug,
    relatedModuleTitle: scenario.internalScoringData.relatedModuleTitle,
    completedAt: new Date().toISOString(),
  };
}

export async function evaluateSimulationOnServer(payload: {
  scenarioId: string;
  actionId: string;
  inspectedEvidenceIds: string[];
}): Promise<SimulationFeedbackRecord> {
  return evaluateSimulationDecisionSync(payload);
}

export function getResumeRouteForSession(session: SessionStateResponse): string {
  const simOrder = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];
  const nextIncompleteSim = simOrder.find((id) => !session.completedScenarioIds.includes(id));
  if (nextIncompleteSim) {
    return `/experience/simulation/${nextIncompleteSim}`;
  }
  return '/report';
}
