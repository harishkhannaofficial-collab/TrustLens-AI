import React from 'react';
import { 
  Shield, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Settings, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  ChevronRight,
  Eye,
  GraduationCap,
  Layers,
  FileCheck,
  Check,
  Zap,
  Users
} from 'lucide-react';
import { Logo } from '../layout/Logo';

interface HomePageProps {
  onStartReview: () => void;
  onTryDemo: () => void;
  onNavigateToLearn: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartReview,
  onTryDemo,
  onNavigateToLearn
}) => {
  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 max-w-7xl mx-auto w-full">
        {/* Subtle glowing backdrop gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-accent-violet/15 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>AI Can Write It. TRUSTLENS Helps You Understand It.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Understand Before <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-violet to-accent-cyan">
                You Deploy.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              AI-generated code can work perfectly and still be dangerous. TRUSTLENS AI reviews your work, explains the risks, shows trusted evidence, teaches you how to fix them, and verifies that you understand what you are deploying.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartReview}
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-violet hover:from-brand-500 hover:to-accent-violet shadow-xl shadow-brand-600/25 transition-all active:scale-98 flex items-center gap-2.5 text-sm"
              >
                <span>Review My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTryDemo}
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-dark-800 hover:bg-dark-750 border border-dark-700 transition-all text-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Try Demo Analysis</span>
              </button>
            </div>

            {/* 4 Quick Category Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
              <div className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-750 flex items-center gap-2 text-xs text-slate-300">
                <Code2 className="w-4 h-4 text-brand-400" />
                <span>Code Analysis</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-750 flex items-center gap-2 text-xs text-slate-300">
                <Settings className="w-4 h-4 text-accent-purple" />
                <span>Config Review</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-750 flex items-center gap-2 text-xs text-slate-300">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Website Audit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-750 flex items-center gap-2 text-xs text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Message Check</span>
              </div>
            </div>

          </div>

          {/* Right Hero: Visual Dashboard Mockup matching Screenshot */}
          <div className="lg:col-span-5 relative">
            <div className="p-1 rounded-2xl bg-gradient-to-b from-brand-500/30 via-accent-violet/20 to-transparent shadow-2xl">
              <div className="rounded-2xl bg-dark-900 border border-dark-750 p-5 flex flex-col gap-4">
                
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-dark-750">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">TRUSTLENS REVIEW #TLR-2024-05-25</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    HIGH RISK
                  </span>
                </div>

                {/* Score Gauges Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-dark-850 border border-dark-750 text-center">
                    <span className="text-[10px] text-slate-400 block">Safety</span>
                    <span className="text-lg font-bold text-emerald-400">82%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-dark-850 border border-dark-750 text-center">
                    <span className="text-[10px] text-slate-400 block">Understanding</span>
                    <span className="text-lg font-bold text-brand-400">45%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-dark-850 border border-dark-750 text-center">
                    <span className="text-[10px] text-slate-400 block">Grounding</span>
                    <span className="text-lg font-bold text-accent-purple">90%</span>
                  </div>
                </div>

                {/* Vulnerable Code Mockup snippet */}
                <div className="p-3 rounded-xl bg-dark-950 font-mono text-xs border border-dark-800 space-y-1">
                  <div className="text-slate-500 text-[10px] font-sans pb-1 flex justify-between">
                    <span>login.py</span>
                    <span className="text-rose-400 font-semibold">2 Critical Issues Found</span>
                  </div>
                  <div className="text-slate-400">conn = mysql.connector.connect(</div>
                  <div className="bg-rose-950/40 text-rose-300 font-semibold px-1 rounded border-l-2 border-rose-500">
                    password="admin123", # &lt;- Hardcoded
                  </div>
                  <div className="text-slate-400">)</div>
                </div>

                {/* Interactive Feature Teaser */}
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-brand-300">
                    <GraduationCap className="w-4 h-4 text-brand-400" />
                    <span>Knowledge Verification Active</span>
                  </div>
                  <button 
                    onClick={onTryDemo}
                    className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-2.5 py-1 rounded transition-colors"
                  >
                    Inspect
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHY TRUSTLENS SECTION (Comparison) */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            The Fundamental Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Can Generate It. But Do You Understand It?
          </h2>
          <p className="text-sm text-slate-400">
            Traditional vulnerability scanners leave developers confused with cryptic error codes. TRUSTLENS AI transforms every risk into a structured learning opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Normal AI Code Reviewer */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-4 opacity-75">
            <div className="flex items-center justify-between pb-3 border-b border-dark-750">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Normal AI Code Reviewer
              </span>
              <span className="text-xs text-rose-400 font-mono">Status: Vague</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="text-rose-400 font-bold">Security problem detected.</div>
              <div>CWE-798: Hard-coded Credentials.</div>
              <div>Severity: Critical.</div>
            </div>

            <p className="text-xs text-slate-400 italic pt-2">
              "The developer copies and pastes the AI's suggested patch without knowing why it was needed or what it changed."
            </p>
          </div>

          {/* TRUSTLENS AI */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-dark-850 to-dark-900 border border-brand-500/40 flex flex-col gap-4 shadow-xl shadow-brand-500/10">
            <div className="flex items-center justify-between pb-3 border-b border-dark-750">
              <div className="flex items-center gap-2">
                <Logo size="sm" showTagline={false} />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                Educational Verification
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">
                Critical Security Problem Found
              </h4>
              <p className="text-xs text-brand-200">
                Your database password is directly written inside your source code.
              </p>
            </div>

            {/* Beginner Explanation Analogy */}
            <div className="p-3 rounded-xl bg-dark-800 border border-dark-700 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 block mb-1">Simple Analogy:</strong>
              Imagine writing your ATM PIN on the front of your wallet with a Sharpie. Anyone who gets access to the wallet can see your PIN immediately.
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authoritative NIST/OWASP Evidence
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Side-by-Side Safe Code Diff
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Line-by-Line Change Explanation
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Interactive Understanding Quiz
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE 6-STAGE LEARNING PIPELINE */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-purple">
            Structured Learning Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The TRUSTLENS Learning Pipeline
          </h2>
          <p className="text-sm text-slate-400">
            Never deploy blind. Progress from detection to demonstrated comprehension before touching production.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {[
            { step: '1', title: 'Discover', desc: 'Detect technical risks automatically across code, configs, websites & messages.', icon: <Eye className="w-5 h-5 text-brand-400" /> },
            { step: '2', title: 'Understand', desc: 'Translate expert terminology into plain, relatable beginner analogies.', icon: <Brain className="w-5 h-5 text-amber-400" /> },
            { step: '3', title: 'See', desc: 'Pinpoint the exact problematic line with syntax highlighting and context.', icon: <Layers className="w-5 h-5 text-cyan-400" /> },
            { step: '4', title: 'Practice', desc: 'Test knowledge against similar transfer scenarios and code variants.', icon: <Laptop className="w-5 h-5 text-accent-purple" /> },
            { step: '5', title: 'Verify', desc: 'Answer interactive comprehension quizzes to score your understanding.', icon: <GraduationCap className="w-5 h-5 text-rose-400" /> },
            { step: '6', title: 'Apply', desc: 'Unlock verified deployment recommendations with confidence.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex flex-col gap-2 relative group hover:border-brand-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-dark-700 group-hover:text-brand-500/40 transition-colors">
                  0{s.step}
                </span>
                <div className="p-2 rounded-lg bg-dark-850 border border-dark-700">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. GROUNDING ENGINE */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-750 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Zero AI Hallucinations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Authoritative Evidence Ranking
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              TRUSTLENS does not allow AI to invent citations. Every recommendation is mapped directly to authoritative sources:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-dark-800 border border-dark-700">
                <span className="font-bold text-indigo-400 block">Level A: Standards</span>
                <span className="text-slate-400">NIST, CISA, MITRE CWE</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-800 border border-dark-700">
                <span className="font-bold text-cyan-400 block">Level B: Vendor Docs</span>
                <span className="text-slate-400">Node.js, Python, Microsoft, AWS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-800 border border-dark-700">
                <span className="font-bold text-amber-400 block">Level C: Security Orgs</span>
                <span className="text-slate-400">OWASP Top 10 & Cheat Sheets</span>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-800 border border-dark-700">
                <span className="font-bold text-slate-400 block">Level D: Community</span>
                <span className="text-slate-500">Never overrides official sources</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-dark-800 border border-dark-700 w-full lg:w-80">
            <span className="text-xs font-bold text-slate-200">Grounding Score Breakdown</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Source Authority</span>
              <span className="text-xs font-bold text-emerald-400">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Evidence Completeness</span>
              <span className="text-xs font-bold text-emerald-400">95%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Traceable URLs</span>
              <span className="text-xs font-bold text-emerald-400">Verified</span>
            </div>
            <div className="pt-3 border-t border-dark-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Overall Grounding</span>
              <span className="text-lg font-extrabold text-accent-purple">90%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TARGET USERS GRID */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Who Is TRUSTLENS For?
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Designed for Modern Builders
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Students & Learners', desc: 'Using ChatGPT, Gemini or Claude for assignments but needing to demonstrate real comprehension.' },
            { title: 'Beginner Developers', desc: 'Rapidly shipping apps with AI assistance while ensuring security fundamentals are not overlooked.' },
            { title: 'Hackathon Teams', desc: 'Building prototypes at lightning speed without introducing fatal deployment vulnerabilities.' },
            { title: 'Startup Founders', desc: 'Verifying that their MVP built with generative AI has solid authentication and configuration.' },
            { title: 'Senior Engineers', desc: 'Adding an automated educational verification gate for junior developers and PR submissions.' },
            { title: 'Educators & Mentors', desc: 'Guiding students to learn the "why" behind software security rather than submitting unverified code.' },
          ].map((u, i) => (
            <div key={i} className="p-5 rounded-xl bg-dark-900 border border-dark-750 flex flex-col gap-2">
              <h3 className="text-sm font-bold text-white">{u.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PRIVACY PROMISE */}
      <section className="px-4 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Code, Your Control</h3>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            All code remains strictly under your control. We automatically redact detected secrets and credentials (e.g. <code className="text-brand-300">sk_live_••••••3456</code>) in UI views and never log sensitive keys.
          </p>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="px-4 max-w-5xl mx-auto w-full text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-brand-600/25 via-accent-violet/20 to-dark-900 border border-brand-500/40 flex flex-col items-center gap-5 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Don't Deploy What You Don't Understand.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Let TRUSTLENS review, explain and verify your AI-generated work before it reaches production.
          </p>
          <button
            onClick={onStartReview}
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-violet hover:from-brand-500 hover:to-accent-violet shadow-xl shadow-brand-600/30 transition-all active:scale-98 text-base flex items-center gap-2"
          >
            <span>Review My Work Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="px-4 max-w-7xl mx-auto w-full pt-12 border-t border-dark-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <button onClick={onStartReview} className="hover:text-slate-300">Review</button>
          <button onClick={onNavigateToLearn} className="hover:text-slate-300">Learn</button>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
        <div>
          © {new Date().getFullYear()} TRUSTLENS AI. Technical verification & learning platform.
        </div>
      </footer>

    </div>
  );
};
