import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from './components/AppShell.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { IntroPage } from './pages/IntroPage.tsx';
import { AssessmentPage } from './pages/AssessmentPage.tsx';
import { SimulationPage } from './pages/SimulationPage.tsx';
import { FeedbackPage } from './pages/FeedbackPage.tsx';
import { LearningCentrePage } from './pages/LearningCentrePage.tsx';
import { ReportPage } from './pages/ReportPage.tsx';
import { SessionStorageAdapter } from './lib/sessionStore.ts';
import {
  SessionStateResponse,
  AssessmentSummary,
  SimulationFeedbackRecord,
} from './types/phishlens.ts';

export default function App() {
  const [session, setSession] = useState<SessionStateResponse>(() =>
    SessionStorageAdapter.loadSession()
  );
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(path);
  }, []);

  const handleResetSession = useCallback(() => {
    const fresh = SessionStorageAdapter.resetSession();
    setSession(fresh);
    navigate('/');
  }, [navigate]);

  const handleStartBaseline = useCallback(() => {
    const updated = SessionStorageAdapter.updateStage('baseline');
    setSession(updated);
    navigate('/experience/baseline');
  }, [navigate]);

  const handleBaselineComplete = useCallback(
    (summary: AssessmentSummary) => {
      const updated = SessionStorageAdapter.saveAssessmentResult(summary);
      setSession(updated);
      navigate('/experience/simulation/sim-1');
    },
    [navigate]
  );

  const handleFinalComplete = useCallback(
    (summary: AssessmentSummary) => {
      const updated = SessionStorageAdapter.saveAssessmentResult(summary);
      setSession(updated);
      navigate('/report');
    },
    [navigate]
  );

  const handleInspectEvidence = useCallback((scenarioId: string, evidenceId: string) => {
    const updated = SessionStorageAdapter.recordEvidenceInspection(scenarioId, evidenceId);
    setSession(updated);
  }, []);

  const handleUpdateRoomTask = useCallback((scenarioId: string, stepIndex: number) => {
    const updated = SessionStorageAdapter.updateRoomTaskProgress(scenarioId, stepIndex);
    setSession(updated);
  }, []);

  const handleSimulationDecision = useCallback(
    (feedback: SimulationFeedbackRecord) => {
      const updated = SessionStorageAdapter.saveSimulationFeedback(feedback);
      setSession(updated);
    },
    []
  );

  const handleCompleteModule = useCallback((slug: string) => {
    const updated = SessionStorageAdapter.markModuleCompleted(slug);
    setSession(updated);
  }, []);

  const renderRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage session={session} navigate={navigate} />;
    }

    if (currentPath === '/experience/intro') {
      return (
        <IntroPage
          session={session}
          onStartBaseline={handleStartBaseline}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/experience/baseline') {
      return (
        <AssessmentPage
          type="baseline"
          onComplete={handleBaselineComplete}
          navigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/experience/simulation/')) {
      const scenarioId = currentPath.replace('/experience/simulation/', '').split('/')[0] || 'sim-1';
      return (
        <SimulationPage
          scenarioId={scenarioId}
          session={session}
          onInspectEvidence={handleInspectEvidence}
          onUpdateRoomTask={handleUpdateRoomTask}
          onDecisionRecorded={handleSimulationDecision}
          navigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/experience/feedback/')) {
      const scenarioId = currentPath.replace('/experience/feedback/', '').split('/')[0] || 'sim-1';
      return (
        <FeedbackPage
          scenarioId={scenarioId}
          session={session}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/learn') {
      return (
        <LearningCentrePage
          session={session}
          onCompleteModule={handleCompleteModule}
          navigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/learn/')) {
      const slug = currentPath.replace('/learn/', '').split('/')[0];
      return (
        <LearningCentrePage
          slug={slug}
          session={session}
          onCompleteModule={handleCompleteModule}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/experience/final-assessment') {
      return (
        <AssessmentPage
          type="final"
          onComplete={handleFinalComplete}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/report') {
      return <ReportPage session={session} navigate={navigate} />;
    }

    return <LandingPage session={session} navigate={navigate} />;
  };

  return (
    <AppShell
      currentPath={currentPath}
      navigate={navigate}
      session={session}
      onResetSession={handleResetSession}
    >
      {renderRoute()}
    </AppShell>
  );
}
