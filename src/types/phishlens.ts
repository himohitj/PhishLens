export type AttackCategory =
  | 'email_phishing'
  | 'fake_login'
  | 'smishing'
  | 'quishing'
  | 'social_engineering'
  | 'password_mfa'
  | 'malware_basics'
  | 'account_security';

export type JourneyStage =
  | 'landing'
  | 'intro'
  | 'baseline'
  | 'simulations'
  | 'learning'
  | 'final_assessment'
  | 'report';

export interface PublicQuestion {
  id: string;
  assessmentType: 'baseline' | 'final';
  number: number;
  category: AttackCategory;
  categoryLabel: string;
  contextLabel: string;
  prompt: string;
  artifactSnippet?: {
    type: 'email_header' | 'sms' | 'url' | 'chat' | 'qr_context';
    sender?: string;
    subject?: string;
    previewText: string;
    technicalCue?: string;
  };
  options: {
    id: string;
    label: string;
    description: string;
  }[];
}

export interface EvidenceHotspot {
  id: string;
  label: string;
  location: string;
  rawValue: string;
  findingTitle: string;
  findingDetail: string;
  termDefinition?: {
    term: string;
    definition: string;
  };
}

export interface SimulationActionOption {
  id: string;
  label: string;
  description: string;
  intentType: 'safe_best' | 'safe_passive' | 'investigative' | 'unsafe';
  requiresConfirmation?: boolean;
}

export interface PublicScenario {
  id: string;
  order: number;
  slug: string;
  title: string;
  subtitle: string;
  attackType: AttackCategory;
  attackTypeLabel: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  situationBrief: string;
  whatShouldIDoHint: string;
  relatedModuleSlug: string;
  evidenceHotspots: EvidenceHotspot[];
  actions: SimulationActionOption[];
  artifact: {
    kind: 'email' | 'login_page' | 'sms' | 'qr_poster' | 'support_chat';
    senderDisplayName?: string;
    senderAddress?: string;
    replyToAddress?: string;
    mailedByDomain?: string;
    subject?: string;
    timestamp: string;
    recipient?: string;
    bodyParagraphs?: string[];
    ctaLabel?: string;
    hoveredDestinationUrl?: string;
    browserUrlBar?: string;
    sslCertificateIssuer?: string;
    pageBrandTitle?: string;
    pageSubtitle?: string;
    fictionalAccountIdentifier?: string;
    smsSenderNumber?: string;
    smsCarrierTag?: string;
    smsMessageText?: string;
    qrPosterLocation?: string;
    qrPosterHeadline?: string;
    qrPosterSubtext?: string;
    qrDecodedPreviewUrl?: string;
    chatAgentName?: string;
    chatAgentBadge?: string;
    chatChannel?: string;
    chatMessages?: {
      sender: 'agent' | 'system' | 'you';
      time: string;
      text: string;
    }[];
  };
}

export interface SimulationFeedbackRecord {
  scenarioId: string;
  scenarioTitle: string;
  attackType: AttackCategory;
  attackTypeLabel: string;
  selectedActionId: string;
  selectedActionLabel: string;
  outcomeClassification: 'optimal' | 'safe_partial' | 'risky' | 'compromised';
  resultHeadline: string;
  scoreEarned: number;
  maxScore: number;
  inspectedEvidenceIds: string[];
  inspectedBonusEarned: boolean;
  actionExplanation: string;
  safestActionLabel: string;
  safestActionRationale: string;
  missedOrSpottedEvidence: {
    id: string;
    label: string;
    rawValue: string;
    wasInspected: boolean;
    explanation: string;
  }[];
  attackMechanics: string;
  realWorldConsequence: string;
  preventionTip: string;
  relatedModuleSlug: string;
  relatedModuleTitle: string;
  completedAt: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  attackType: AttackCategory;
  attackTypeLabel: string;
  readingTimeMinutes: number;
  whatItIs: string;
  howItWorks: string[];
  warningSigns: {
    signal: string;
    explanation: string;
  }[];
  fictionalExample: {
    title: string;
    context: string;
    artifactText: string;
    deceptionBreakdown: string;
  };
  whatToDo: string[];
  whatNotToDo: string[];
  knowledgeCheck: {
    question: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      feedback: string;
    }[];
  };
}

export interface AssessmentSummary {
  type: 'baseline' | 'final';
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  submittedAt: string;
  categoryBreakdown: {
    category: AttackCategory;
    categoryLabel: string;
    correct: number;
    total: number;
  }[];
  questionResults?: {
    questionId: string;
    number: number;
    category: AttackCategory;
    categoryLabel: string;
    prompt: string;
    selectedOptionId: string;
    selectedOptionLabel: string;
    correctOptionLabel: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface SessionStateResponse {
  sessionId: string;
  currentStage: JourneyStage;
  startedAt: string;
  completedAt: string | null;
  baselineAssessment: AssessmentSummary | null;
  finalAssessment: AssessmentSummary | null;
  completedScenarioIds: string[];
  simulationFeedbacks: Record<string, SimulationFeedbackRecord>;
  inspectedEvidenceByScenario: Record<string, string[]>;
  roomTaskProgress: Record<string, number>;
  completedModuleSlugs: string[];
}
