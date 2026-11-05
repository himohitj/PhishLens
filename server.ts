import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import {
  BASELINE_QUESTIONS,
  FINAL_QUESTIONS,
  SCENARIOS,
  LEARNING_MODULES,
  getPublicQuestions,
  getPublicScenarios,
  getPublicScenarioById,
} from './src/server/data.ts';
import { AttackCategory, AssessmentSummary, SimulationFeedbackRecord } from './src/types/phishlens.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AssessmentSubmitSchema = z.object({
  type: z.enum(['baseline', 'final']),
  timeTakenSeconds: z.number().int().min(1).max(7200),
  answers: z.record(z.string(), z.string()),
});

const SimulationDecisionSchema = z.object({
  scenarioId: z.string().min(1).max(64),
  actionId: z.string().min(1).max(64),
  inspectedEvidenceIds: z.array(z.string().max(64)).max(20),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());

  // 1. Public Content Endpoints (Internal answer keys are never exposed here)
  app.get('/api/questions/:type', (req, res) => {
    const type = req.params.type;
    if (type !== 'baseline' && type !== 'final') {
      res.status(400).json({ error: 'Invalid assessment type.' });
      return;
    }
    res.json({ questions: getPublicQuestions(type) });
  });

  app.get('/api/scenarios', (_req, res) => {
    res.json({ scenarios: getPublicScenarios() });
  });

  app.get('/api/scenarios/:id', (req, res) => {
    const scenario = getPublicScenarioById(req.params.id);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found.' });
      return;
    }
    res.json({ scenario });
  });

  app.get('/api/modules', (_req, res) => {
    res.json({ modules: LEARNING_MODULES });
  });

  // 2. Server-Validated Assessment Evaluation
  app.post('/api/assessments/evaluate', (req, res) => {
    const parsed = AssessmentSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid assessment submission payload.' });
      return;
    }

    const { type, timeTakenSeconds, answers } = parsed.data;
    const questions = type === 'baseline' ? BASELINE_QUESTIONS : FINAL_QUESTIONS;

    let score = 0;
    const categoryStats: Record<AttackCategory, { category: AttackCategory; categoryLabel: string; correct: number; total: number }> =
      {} as Record<AttackCategory, { category: AttackCategory; categoryLabel: string; correct: number; total: number }>;

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

    const summary: AssessmentSummary = {
      type,
      score,
      totalQuestions,
      percentage,
      timeTakenSeconds,
      submittedAt: new Date().toISOString(),
      categoryBreakdown: Object.values(categoryStats),
      // Do not include detailed question answer explanations in baseline if we want to prevent baseline answer gaming,
      // or include them only on final / report review.
      questionResults: type === 'final' ? questionResults : undefined,
    };

    res.json({ summary });
  });

  // 3. Server-Validated Simulation Decision Evaluation
  app.post('/api/simulations/evaluate', (req, res) => {
    const parsed = SimulationDecisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid simulation decision payload.' });
      return;
    }

    const { scenarioId, actionId, inspectedEvidenceIds } = parsed.data;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found.' });
      return;
    }

    const actionOption = scenario.actions.find((a) => a.id === actionId);
    const scoring = scenario.internalScoringData.actionScores[actionId];
    if (!actionOption || !scoring) {
      res.status(400).json({ error: 'Invalid action ID for this scenario.' });
      return;
    }

    const uniqueInspected = Array.from(
      new Set(inspectedEvidenceIds.filter((id) => scenario.evidenceHotspots.some((h) => h.id === id)))
    );

    const inspectedBonusEarned = uniqueInspected.length >= 2 && scoring.score > 0;
    const finalScore = Math.min(100, scoring.score + (inspectedBonusEarned ? 5 : 0));

    const feedback: SimulationFeedbackRecord = {
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

    res.json({ feedback });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhishLens server running on http://localhost:${PORT}`);
  });
}

startServer();
