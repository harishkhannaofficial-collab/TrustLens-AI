import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { HomePage } from './components/pages/HomePage';
import { ReviewCreationPage } from './components/pages/ReviewCreationPage';
import { LearningCenterPage } from './components/pages/LearningCenterPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { LeftScoreSidebar } from './components/review/LeftScoreSidebar';
import { CenterCodeViewer } from './components/review/CenterCodeViewer';
import { RightInspectorDrawer } from './components/review/RightInspectorDrawer';
import { AnalysisLoadingModal } from './components/review/AnalysisLoadingModal';
import { FalsePositiveModal } from './components/review/FalsePositiveModal';
import { ReportModal } from './components/review/ReportModal';
import { 
  loadAllReviews, 
  saveAllReviews, 
  getActiveReviewId, 
  setActiveReviewId, 
  updateReviewFindingStatus, 
  applyAiAutoFixAll,
  submitQuizAnswer 
} from './lib/storage/store';
import { getInitialDemoReview } from './lib/storage/demoProject';
import { runFullAnalysis, RunAnalysisParams } from './lib/analyzers/orchestrator';
import { Review, ReviewType, Finding } from './types/review';
import { User } from './types/user';
import { getCurrentUser, logoutUser } from './lib/storage/userStore';
import { AuthModal } from './components/auth/AuthModal';
import { LiquidLightEngine } from './components/effects/LiquidLightEngine';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Theme Management (Dark Mode / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('trustlens_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('trustlens_theme', theme);
    } catch (e) {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeTab, setActiveTab] = useState<NavTab>('review');
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [reviewCreationType, setReviewCreationType] = useState<ReviewType>('code');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string>('');

  // Modals
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingAnalysisParams, setPendingAnalysisParams] = useState<RunAnalysisParams | null>(null);
  const [isFalsePositiveModalOpen, setIsFalsePositiveModalOpen] = useState(false);
  const [targetFpFinding, setTargetFpFinding] = useState<Finding | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Initialize reviews from store
  useEffect(() => {
    const loaded = loadAllReviews();
    setReviews(loaded);
    
    const activeId = getActiveReviewId();
    const current = loaded.find(r => r.id === activeId) || loaded[0] || getInitialDemoReview();
    setActiveReview(current);
    if (current.findings.length > 0) {
      setSelectedFindingId(current.findings[0].id);
    }
  }, []);

  const handleOpenNewReview = (type: ReviewType = 'code') => {
    setReviewCreationType(type);
    setIsCreatingReview(true);
    setActiveTab('review');
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleSelectReviewType = (type: ReviewType) => {
    handleOpenNewReview(type);
  };

  const handleStartAnalysis = (params: RunAnalysisParams) => {
    setPendingAnalysisParams(params);
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    if (!pendingAnalysisParams) {
      setIsAnalyzing(false);
      return;
    }

    const newReview = runFullAnalysis(pendingAnalysisParams);
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    saveAllReviews(updatedReviews);

    setActiveReview(newReview);
    setActiveReviewId(newReview.id);
    if (newReview.findings.length > 0) {
      setSelectedFindingId(newReview.findings[0].id);
    }

    setIsAnalyzing(false);
    setPendingAnalysisParams(null);
    setIsCreatingReview(false);
    setActiveTab('review');
  };

  const handleTryDemo = () => {
    const demo = getInitialDemoReview();
    const existingIndex = reviews.findIndex(r => r.id === demo.id);
    let updated: Review[];
    if (existingIndex >= 0) {
      updated = [...reviews];
      updated[existingIndex] = demo;
    } else {
      updated = [demo, ...reviews];
    }
    setReviews(updated);
    saveAllReviews(updated);
    setActiveReview(demo);
    setActiveReviewId(demo.id);
    if (demo.findings.length > 0) {
      setSelectedFindingId(demo.findings[0].id);
    }
    setIsCreatingReview(false);
    setActiveTab('review');
  };

  const handleOpenReview = (reviewId: string) => {
    const found = reviews.find(r => r.id === reviewId);
    if (found) {
      setActiveReview(found);
      setActiveReviewId(found.id);
      if (found.findings.length > 0) {
        setSelectedFindingId(found.findings[0].id);
      }
      setIsCreatingReview(false);
      setActiveTab('review');
    }
  };

  const handleResolveFinding = (findingId: string) => {
    if (!activeReview) return;
    const updated = updateReviewFindingStatus(activeReview.id, findingId, 'resolved');
    if (updated) {
      setActiveReview({ ...updated });
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  };

  const handleResolveAllFindings = () => {
    if (!activeReview) return;
    const updated = applyAiAutoFixAll(activeReview.id);
    if (updated) {
      setActiveReview({ ...updated });
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  };

  const handleOpenFalsePositiveModal = (finding: Finding) => {
    setTargetFpFinding(finding);
    setIsFalsePositiveModalOpen(true);
  };

  const handleConfirmDismiss = (findingId: string, reason: string) => {
    if (!activeReview) return;
    const updated = updateReviewFindingStatus(activeReview.id, findingId, 'dismissed', reason);
    if (updated) {
      setActiveReview({ ...updated });
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  };

  const handleSubmitQuiz = (questionId: string, selectedOptionId: string) => {
    if (!activeReview) return;
    const res = submitQuizAnswer(activeReview.id, questionId, selectedOptionId);
    if (res) {
      setActiveReview({ ...res.review });
      setReviews(prev => prev.map(r => r.id === res.review.id ? res.review : r));
    }
  };

  const selectedFinding = activeReview?.findings.find(f => f.id === selectedFindingId) || activeReview?.findings[0] || null;

  return (
    <div className={`min-h-screen flex flex-col relative ${theme === 'dark' ? 'bg-[#080c16] text-slate-100' : 'bg-slate-50 text-slate-900'} selection:bg-brand-500 selection:text-white transition-colors duration-200 overflow-x-hidden`}>
      
      {/* iOS 26 Liquid Glass Light & Physics Engine */}
      <LiquidLightEngine />

      {/* Apple Liquid Retina Ambient Glow Mesh */}
      <div className="liquid-aurora" aria-hidden="true">
        <div className="liquid-blob-1" />
        <div className="liquid-blob-2" />
        <div className="liquid-blob-3" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Global Navigation Header matching Screenshot with Dynamic User Authentication & Theme Toggle */}
        <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'review') setIsCreatingReview(false);
        }}
        onNewReviewClick={() => handleOpenNewReview()}
        currentUser={currentUser}
        onLoginClick={handleOpenLogin}
        onRegisterClick={handleOpenRegister}
        onLogoutClick={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Areas */}
      <main className="flex-1 w-full">
        
        {/* View 1: Homepage (SaaS Landing) */}
        {activeTab === 'home' && (
          <HomePage
            onStartReview={() => handleOpenNewReview()}
            onTryDemo={handleTryDemo}
            onNavigateToLearn={() => setActiveTab('learn')}
          />
        )}

        {/* View 2: Review Workspace OR Review Creation Studio */}
        {activeTab === 'review' && (
          isCreatingReview ? (
            <ReviewCreationPage
              initialType={reviewCreationType}
              onCancel={activeReview ? () => setIsCreatingReview(false) : undefined}
              onStartAnalysis={handleStartAnalysis}
            />
          ) : activeReview ? (
            <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
              
              {/* 3-Column Desktop Layout matching Screenshot */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Column 1: Left Score Sidebar */}
                <LeftScoreSidebar
                  activeReviewType={activeReview.projectType}
                  onSelectReviewType={handleSelectReviewType}
                  onNewReviewClick={() => handleOpenNewReview()}
                  safetyScore={activeReview.scores.safetyScore}
                  safetyScoreSource={activeReview.scores.safetyScoreSource}
                  scamAdviserRating={activeReview.scamAdviserRating}
                  understandingScore={activeReview.scores.understandingScore}
                  groundingScore={activeReview.scores.groundingScore}
                  deploymentRisk={activeReview.scores.deploymentRisk}
                  onSeeDetailsClick={() => setIsReportModalOpen(true)}
                />

                {/* Column 2: Center Code Viewer & Issues */}
                <CenterCodeViewer
                  review={activeReview}
                  selectedFindingId={selectedFindingId}
                  onSelectFinding={(id) => setSelectedFindingId(id)}
                  onGenerateReportClick={() => setIsReportModalOpen(true)}
                  onResolveFinding={handleResolveFinding}
                  onResolveAllFindings={handleResolveAllFindings}
                  onOpenFalsePositiveModal={handleOpenFalsePositiveModal}
                  readinessPercentage={
                    activeReview.checklist.readyToDeploy || activeReview.scores.safetyScore === 100 || (activeReview.scores.fixationRate ?? 0) === 100
                      ? 100 
                      : activeReview.scores.safetyScore >= 80 && activeReview.scores.understandingScore >= 80 
                      ? 85 
                      : Math.max(35, activeReview.scores.safetyScore)
                  }
                />

                {/* Column 3: Right Educational Inspector Drawer */}
                <RightInspectorDrawer
                  finding={selectedFinding}
                  review={activeReview}
                  onSubmitQuiz={handleSubmitQuiz}
                  onApplyFix={(f) => handleResolveFinding(f.id)}
                  onResolveAllFixes={handleResolveAllFindings}
                />

              </div>
            </div>
          ) : (
            <ReviewCreationPage
              initialType={reviewCreationType}
              onStartAnalysis={handleStartAnalysis}
            />
          )
        )}

        {/* View 4: Learning Center */}
        {activeTab === 'learn' && (
          <LearningCenterPage
            reviews={reviews}
            activeReview={activeReview}
            onNavigateToReview={handleOpenReview}
          />
        )}

        {/* View 5: Dashboard / History */}
        {(activeTab === 'dashboard' || activeTab === 'history') && (
          <DashboardPage
            reviews={reviews}
            currentUser={currentUser}
            onOpenReview={handleOpenReview}
            onNewReviewClick={() => handleOpenNewReview()}
          />
        )}

        {/* View 6: Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings & Trust Architecture</h1>
            <div className="p-6 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-4 text-xs text-slate-300">
              <h3 className="text-sm font-bold text-white">Privacy & Secret Redaction</h3>
              <p>TRUSTLENS automatically redacts high-entropy API tokens and passwords in user interfaces.</p>
              <div className="p-3 rounded-lg bg-dark-850 border border-dark-700 font-mono text-emerald-400">
                Active Policy: Redact in logs • Client-side sandboxing active • Zero unauthorized training retention
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 10-Stage Animated Scanning Modal */}
      <AnalysisLoadingModal
        isOpen={isAnalyzing}
        onComplete={handleAnalysisComplete}
        projectTitle={pendingAnalysisParams?.title || 'Submitted Project'}
      />

      {/* False Positive Dismissal Feedback Modal */}
      <FalsePositiveModal
        finding={targetFpFinding}
        isOpen={isFalsePositiveModalOpen}
        onClose={() => setIsFalsePositiveModalOpen(false)}
        onConfirmDismiss={handleConfirmDismiss}
      />

      {/* Printable / PDF Report Generator Modal */}
      {activeReview && (
        <ReportModal
          review={activeReview}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Authentication & User Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      </div>
    </div>
  );
};
