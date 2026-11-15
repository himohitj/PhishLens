import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { PublicQuestion, AssessmentSummary } from '../types/phishlens.ts';
import { fetchPublicQuestions, evaluateAssessmentOnServer } from '../lib/sessionStore.ts';

interface AssessmentPageProps {
  type: 'baseline' | 'final';
  onComplete: (summary: AssessmentSummary) => void;
  navigate: (path: string) => void;
}

export function AssessmentPage({ type, onComplete, navigate }: AssessmentPageProps) {
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    startTimeRef.current = Date.now();

    fetchPublicQuestions(type)
      .then((qList) => {
        if (!mounted) return;
        // Keep scenario check brief (first 3 scenarios) so it never feels like a long exam
        setQuestions(qList.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load scenarios.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [type]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const summary = await evaluateAssessmentOnServer({
        type,
        timeTakenSeconds: elapsedSeconds,
        answers,
      });
      onComplete(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-7 h-7 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-muted">Loading Quick Scenario Check...</p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const selectedOptionId = answers[currentQuestion.id] || '';

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6 stagger-children">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-surface border border-line rounded-3xl px-5 py-3.5 shadow-soft">
        <div>
          <div className="text-xs font-bold text-brand">
            {type === 'baseline' ? 'Quick Starting Calibration' : 'Quick Final Check'} · Scenario{' '}
            {currentIndex + 1} of {totalQuestions}
          </div>
          <p className="text-xs text-muted">
            {type === 'baseline'
              ? 'A 60-second check before jumping into the 5 interactive simulations.'
              : 'Compare your instincts after completing the interactive simulations.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/experience/simulation/sim-1')}
          className="text-xs font-semibold text-brand hover:underline cursor-pointer"
        >
          Skip Straight to Simulations →
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scenario Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="bg-surface border border-line rounded-3xl p-6 space-y-5 shadow-soft"
      >
        <div className="space-y-2">
          <span className="text-xs font-mono text-brand font-semibold">
            {currentQuestion.categoryLabel}
          </span>
          <h1 className="text-lg font-bold text-ink leading-snug">
            {currentQuestion.prompt}
          </h1>
        </div>

        {currentQuestion.artifactSnippet && (
          <div className="bg-canvas border border-line rounded-xl p-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand" />
                <span>Artifact Preview</span>
              </span>
              {currentQuestion.artifactSnippet.sender && (
                <span className="font-mono text-[11px] text-brand">
                  {currentQuestion.artifactSnippet.sender}
                </span>
              )}
            </div>
            <p className="font-mono text-ink leading-relaxed">
              {currentQuestion.artifactSnippet.previewText}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-blush border-brand text-ink'
                    : 'bg-canvas border-line hover:border-brand-soft text-ink'
                }`}
              >
                <div className="text-xs font-bold leading-snug">{option.label}</div>
                <div className="text-[11px] text-muted leading-relaxed">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => {
              if (currentIndex > 0) setCurrentIndex((p) => p - 1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={() => setCurrentIndex((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
            >
              <span>Next Scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedOptionId || isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : type === 'baseline'
                  ? 'Finish & Launch Simulations'
                  : 'Finish & View Report'}
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
