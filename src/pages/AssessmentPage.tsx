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
        <div className="w-7 h-7 rounded-full border-2 border-[#D94F89] border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-[#716B76]">Loading Quick Scenario Check...</p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const selectedOptionId = answers[currentQuestion.id] || '';

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-[#F0E7ED] rounded-2xl px-5 py-3.5 shadow-2xs">
        <div>
          <div className="text-xs font-bold text-[#D94F89]">
            {type === 'baseline' ? 'Quick Starting Calibration' : 'Quick Final Check'} · Scenario{' '}
            {currentIndex + 1} of {totalQuestions}
          </div>
          <p className="text-xs text-[#716B76]">
            {type === 'baseline'
              ? 'A 60-second check before jumping into the 5 interactive simulations.'
              : 'Compare your instincts after completing the interactive simulations.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/experience/simulation/sim-1')}
          className="text-xs font-semibold text-[#D94F89] hover:underline cursor-pointer"
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
        className="bg-white border border-[#F0E7ED] rounded-2xl p-6 space-y-5 shadow-xs"
      >
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#D94F89] font-semibold">
            {currentQuestion.categoryLabel}
          </span>
          <h1 className="text-lg font-bold text-[#24212A] leading-snug">
            {currentQuestion.prompt}
          </h1>
        </div>

        {currentQuestion.artifactSnippet && (
          <div className="bg-[#FCFAFC] border border-[#F0E7ED] rounded-xl p-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#716B76]">
              <span className="font-semibold text-[#24212A] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#D94F89]" />
                <span>Artifact Preview</span>
              </span>
              {currentQuestion.artifactSnippet.sender && (
                <span className="font-mono text-[11px] text-[#D94F89]">
                  {currentQuestion.artifactSnippet.sender}
                </span>
              )}
            </div>
            <p className="font-mono text-[#24212A] leading-relaxed">
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
                    ? 'bg-[#FFF1F6] border-[#D94F89] text-[#24212A]'
                    : 'bg-[#FCFAFC] border-[#F0E7ED] hover:border-[#E879A8] text-[#24212A]'
                }`}
              >
                <div className="text-xs font-bold leading-snug">{option.label}</div>
                <div className="text-[11px] text-[#716B76] leading-relaxed">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F0E7ED]">
          <button
            type="button"
            onClick={() => {
              if (currentIndex > 0) setCurrentIndex((p) => p - 1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#716B76] hover:text-[#24212A] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={() => setCurrentIndex((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
            >
              <span>Next Scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedOptionId || isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
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
