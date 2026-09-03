import React, { useState } from 'react';
import { ReviewType, Review } from '../../types/review';
import { 
  Code2, 
  Settings, 
  Globe, 
  AlertTriangle, 
  Sparkles, 
  Upload, 
  FileCode, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  Info,
  RotateCcw,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { SCREENSHOT_PYTHON_DEMO, NODE_EXPRESS_DEMO } from '../../lib/storage/demoProject';

const CLEAN_SECURE_PYTHON_DEMO = `import os
import mysql.connector

def get_user_account(user_id):
    # Secure: Credentials loaded safely from runtime environment
    db_password = os.environ.get("DB_PASSWORD", "")
    
    connection = mysql.connector.connect(
        host="localhost",
        user="app_user",
        password=db_password,
        database="production_db"
    )
    cursor = connection.cursor(prepared=True)

    # Secure: Parameterized query neutralizes SQL injection
    query = "SELECT id, username, email FROM users WHERE id = %s"
    cursor.execute(query, (user_id,))
    return cursor.fetchone()`;

const COMMAND_INJECTION_DEMO = `const { exec } = require('child_process');
const express = require('express');
const app = express();

// Vulnerable endpoint: Remote Command Execution (CWE-78)
app.get('/api/ping', (req, res) => {
  const host = req.query.host;
  exec("ping -c 1 " + host, (err, stdout) => {
    res.send(stdout);
  });
});`;

interface ReviewCreationPageProps {
  initialType?: ReviewType;
  onCancel?: () => void;
  onStartAnalysis: (params: {
    projectType: ReviewType;
    title: string;
    sourceCode: string;
    fileName: string;
    language: string;
    aiOrigin: string;
    aiRatio: string;
    projectContext: string;
  }) => void;
}

export const ReviewCreationPage: React.FC<ReviewCreationPageProps> = ({
  initialType = 'code',
  onCancel,
  onStartAnalysis
}) => {
  const [selectedType, setSelectedType] = useState<ReviewType>(initialType);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  
  const [title, setTitle] = useState('New Project Review');
  const [language, setLanguage] = useState('Python');
  const [aiOrigin, setAiOrigin] = useState('ChatGPT');
  const [aiRatio, setAiRatio] = useState('Mostly AI generated');
  const [projectContext, setProjectContext] = useState('Technical verification & risk analysis');
  const [sourceCode, setSourceCode] = useState('');
  const [fileName, setFileName] = useState('main.py');

  const reviewCategories = [
    {
      id: 'code' as ReviewType,
      title: 'Code Analysis',
      icon: <Code2 className="w-6 h-6 text-brand-400" />,
      desc: 'Review AI-generated source code for security vulnerabilities, logic errors, bad practices, and deployment risks.',
      badges: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'PHP', 'C++']
    },
    {
      id: 'configuration' as ReviewType,
      title: 'Configuration Review',
      icon: <Settings className="w-6 h-6 text-accent-purple" />,
      desc: 'Analyze sensitive configuration files: .env files, Dockerfiles, docker-compose, Nginx, and cloud setups.',
      badges: ['.env', 'Dockerfile', 'docker-compose', 'YAML', 'JSON', 'nginx.conf']
    },
    {
      id: 'website' as ReviewType,
      title: 'Website / URL Review',
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      desc: 'Safe, passive audit of public URLs: HTTPS certificates, Content Security Policy, and HTTP security headers.',
      badges: ['Passive Only', 'HTTPS', 'CSP Headers', 'Cookie Flags']
    },
    {
      id: 'message' as ReviewType,
      title: 'Suspicious Message Check',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      desc: 'Analyze emails, SMS, WhatsApp or Telegram messages for phishing patterns, artificial urgency, and scam lures.',
      badges: ['Phishing', 'Social Engineering', 'Credential Lures']
    }
  ];

  const handleSelectCategory = (type: ReviewType) => {
    setSelectedType(type);
    if (type === 'code') {
      setTitle('Code Review – Login System');
      setFileName('login.py');
      setLanguage('Python');
      setSourceCode(SCREENSHOT_PYTHON_DEMO);
    } else if (type === 'configuration') {
      setTitle('Docker & Environment Review');
      setFileName('.env');
      setLanguage('Configuration');
      setSourceCode(`DB_PASSWORD="admin123"\nDEBUG=true\nPORT=3000\nCORS_ORIGIN="*"`);
    } else if (type === 'website') {
      setTitle('Target Website Audit');
      setFileName('URL');
      setLanguage('HTTP');
      setSourceCode('http://my-demo-website.com');
    } else if (type === 'message') {
      setTitle('Suspicious Message Analysis');
      setFileName('message.txt');
      setLanguage('Text');
      setSourceCode('URGENT: Your bank account will be suspended immediately within 24 hours. Click here to verify your password: http://bank-verify-secure.fake-domain.com');
    }
  };

  const loadPythonScreenshotDemo = () => {
    setSelectedType('code');
    setTitle('Code Review – Login System');
    setFileName('login.py');
    setLanguage('Python');
    setProjectContext('Database authentication service connecting to MySQL');
    setSourceCode(SCREENSHOT_PYTHON_DEMO);
  };

  const loadNodeExpressDemo = () => {
    setSelectedType('code');
    setTitle('Node Authentication API');
    setFileName('server.js');
    setLanguage('JavaScript');
    setProjectContext('This is a Node.js login API connected to MongoDB');
    setSourceCode(NODE_EXPRESS_DEMO);
  };

  const loadCleanSecureDemo = () => {
    setSelectedType('code');
    setTitle('Clean Secure Service (100% Score)');
    setFileName('auth_service.py');
    setLanguage('Python');
    setProjectContext('Secure database service utilizing environment variables and parameterized SQL');
    setSourceCode(CLEAN_SECURE_PYTHON_DEMO);
  };

  const loadCommandInjectionDemo = () => {
    setSelectedType('code');
    setTitle('Node.js Ping Utility (RCE / CWE-78)');
    setFileName('ping_server.js');
    setLanguage('JavaScript');
    setProjectContext('System command executor vulnerable to remote command injection');
    setSourceCode(COMMAND_INJECTION_DEMO);
  };

  const handleClearCode = () => {
    setSourceCode('');
    setTitle('New Code Review');
    setFileName('source.py');
  };

  const handleCodeChange = (text: string) => {
    setSourceCode(text);
    if (!text.trim()) return;

    // Auto-detect language and adapt filename
    if (/import\s+os|def\s+|print\(|elif\s+|cursor\.execute/i.test(text)) {
      setLanguage('Python');
      if (fileName.endsWith('.js') || fileName === 'main.py' || fileName === 'source.py') {
        setFileName('app.py');
      }
    } else if (/const\s+|let\s+|require\(|function\s+|console\.log/i.test(text)) {
      setLanguage('JavaScript');
      if (fileName.endsWith('.py') || fileName === 'main.py' || fileName === 'source.py') {
        setFileName('server.js');
      }
    } else if (/interface\s+|:\s*string|:\s*number|type\s+[A-Z]/i.test(text)) {
      setLanguage('TypeScript');
      if (fileName.endsWith('.py') || fileName.endsWith('.js')) {
        setFileName('index.ts');
      }
    } else if (/public\s+class|public\s+static\s+void\s+main/i.test(text)) {
      setLanguage('Java');
      setFileName('Main.java');
    } else if (/func\s+main\(\)|package\s+main/i.test(text)) {
      setLanguage('Go');
      setFileName('main.go');
    } else if (/<\?php/i.test(text)) {
      setLanguage('PHP');
      setFileName('index.php');
    } else if (/^https?:\/\/[^\s]+$/i.test(text.trim())) {
      setSelectedType('website');
      setLanguage('HTTP');
      setFileName('URL');
      setTitle(`Website Audit: ${text.trim()}`);
    }
  };

  const loadUnauthorizedWebsiteDemo = () => {
    setSelectedType('website');
    setTitle('Unauthorized Domain Audit: paypal-verify-account.xyz');
    setFileName('URL');
    setLanguage('HTTP');
    setProjectContext('Passive domain authenticity and ScamAdviser threat reputation audit');
    setSourceCode('https://paypal-verify-account.xyz/login?security_update=true');
  };

  const loadSmsSmishingDemo = () => {
    setSelectedType('message');
    setTitle('SMS Smishing: USPS Parcel Delivery Lure');
    setFileName('sms_message.txt');
    setLanguage('SMS');
    setProjectContext('Smishing analysis of urgent parcel delivery notification with external shortlink');
    setSourceCode(`[USPS Alert]: Your package is on hold at our distribution terminal due to an incomplete address.\nAction required now within 24 hours to avoid package return: http://usps-redelivery-tracking.xyz/update`);
  };

  const loadWhatsAppScamDemo = () => {
    setSelectedType('message');
    setTitle('WhatsApp Scam: Relative Impersonation');
    setFileName('whatsapp_chat.txt');
    setLanguage('WhatsApp');
    setProjectContext('Social engineering inspection of emergency money request from unfamiliar number');
    setSourceCode(`Hi mum, I dropped my phone in the water and broke it.\nThis is my new number, please save this.\nCan you transfer $450 urgently via Zelle to pay this invoice for me?`);
  };

  const loadTelegramTaskDemo = () => {
    setSelectedType('message');
    setTitle('Telegram Scam: Fake Job & Crypto Drainer');
    setFileName('telegram_post.txt');
    setLanguage('Telegram');
    setProjectContext('Inspection of unsolicited task recruitment and crypto wallet drainer link');
    setSourceCode(`Part-time job opportunity! Earn $500 daily by reviewing apps and liking YouTube videos.\nNo experience needed. Contact our HR on Telegram @manager_crypto.\nClaim free 5,000 USDT airdrop now: t.me/airdrop_claim_bot`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setTitle(`Review of ${file.name}`);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;

    onStartAnalysis({
      projectType: selectedType,
      title,
      sourceCode,
      fileName,
      language,
      aiOrigin,
      aiRatio,
      projectContext
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Back Button if onCancel is present */}
      {onCancel && (
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-dark-750 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-400" />
            <span>Back to Active Review Workspace</span>
          </button>
        </div>
      )}

      {/* Heading */}
      <div className="text-left flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          What would you like TRUSTLENS to review?
        </h1>
        <p className="text-sm text-slate-400">
          Select a review category, provide your AI-generated technical work, and unlock authoritative verification.
        </p>
      </div>

      {/* 4 Large Selectable Cards matching prompt Section 9 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviewCategories.map((cat) => {
          const isSelected = selectedType === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                isSelected 
                  ? 'bg-dark-850 border-brand-500/80 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/50' 
                  : 'bg-dark-900 border-dark-750 hover:border-dark-600 hover:bg-dark-850/60'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-dark-800 border border-dark-700">
                    {cat.icon}
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {cat.badges.map((b, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-750 font-mono">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Demo Pre-loaders */}
      <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Need sample demonstration input? Click one to load instantly:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadCleanSecureDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🛡️ Clean Secure Code (100% Score)</span>
          </button>
          <button
            type="button"
            onClick={loadPythonScreenshotDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600/30 transition-colors"
          >
            🚨 Python Vulnerabilities (Password & SQLi)
          </button>
          <button
            type="button"
            onClick={loadCommandInjectionDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
          >
            ⚡ Node.js Shell Injection (RCE)
          </button>
          <button
            type="button"
            onClick={loadUnauthorizedWebsiteDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors flex items-center gap-1.5"
          >
            <span>🚨 Unauthorized Site (ScamAdviser)</span>
          </button>
          <button
            type="button"
            onClick={loadSmsSmishingDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition-colors flex items-center gap-1.5"
          >
            <span>📱 SMS Smishing (USPS Lure)</span>
          </button>
          <button
            type="button"
            onClick={loadWhatsAppScamDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
          >
            <span>💬 WhatsApp Relative Scam</span>
          </button>
          <button
            type="button"
            onClick={loadTelegramTaskDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors flex items-center gap-1.5"
          >
            <span>✈️ Telegram Crypto & Job Lure</span>
          </button>
          {sourceCode && (
            <button
              type="button"
              onClick={handleClearCode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Code / Content Input Form matching Section 10 */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-6 shadow-xl">
        
        {/* Project Context & Meta Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Review Title / Module:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node Authentication API"
              className="p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Programming Language / Format:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="PHP">PHP</option>
              <option value="C++">C / C++</option>
              <option value="Configuration">Configuration (env, YAML, Docker)</option>
              <option value="Text">Plain Text / Message</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              AI Generated By:
            </label>
            <select
              value={aiOrigin}
              onChange={(e) => setAiOrigin(e.target.value)}
              className="p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ChatGPT">ChatGPT (OpenAI)</option>
              <option value="Gemini">Gemini (Google)</option>
              <option value="Claude">Claude (Anthropic)</option>
              <option value="Copilot">GitHub Copilot</option>
              <option value="Other">Other Generative Model</option>
              <option value="Unknown">Unknown / Human Mixed</option>
            </select>
          </div>

        </div>

        {/* Second Row: Project Context & AI Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Project Context (What is this code supposed to do?):
            </label>
            <input
              type="text"
              value={projectContext}
              onChange={(e) => setProjectContext(e.target.value)}
              placeholder="e.g. This is a Node.js login API connected to MongoDB"
              className="p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              AI Content Ratio (Context only):
            </label>
            <select
              value={aiRatio}
              onChange={(e) => setAiRatio(e.target.value)}
              className="p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Entirely AI generated">Entirely AI generated (100%)</option>
              <option value="Mostly AI generated">Mostly AI generated (&gt;75%)</option>
              <option value="Partially AI generated">Partially AI generated (~50%)</option>
              <option value="Mostly human written">Mostly human written</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        {/* Input Tabs: Paste Code vs Upload File */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-dark-750 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Code / Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                File: <strong className="text-slate-200">{fileName}</strong> ({language})
              </span>
              {sourceCode && (
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'paste' ? (
            <textarea
              value={sourceCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={14}
              placeholder="Paste any source code (Python, JavaScript, TypeScript, Go, Java, PHP, SQL), configuration (.env, Docker), or suspicious message/URL here for accurate, line-by-line verification..."
              className="w-full p-4 rounded-xl bg-dark-950 border border-dark-750 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          ) : (
            <div className="p-8 border-2 border-dashed border-dark-700 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
              <Upload className="w-8 h-8 text-brand-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Select a file to upload</span>
                <span className="text-xs text-slate-400">Supported: .py, .js, .ts, .java, .env, .json, .yaml, .txt</span>
              </div>
              <label className="mt-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold cursor-pointer transition-colors">
                Browse Files
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Submit Button + Responsible Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-dark-750">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>TRUSTLENS provides educational verification. Critical systems should still receive professional audit.</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-violet hover:from-brand-500 hover:to-accent-violet shadow-xl shadow-brand-600/30 text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze With TRUSTLENS</span>
          </button>
        </div>

      </form>

    </div>
  );
};
