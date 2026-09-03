export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingCategory = 'security' | 'logic' | 'configuration' | 'privacy' | 'code-quality' | 'injection' | 'authentication';
export type FindingStatus = 'unresolved' | 'resolved' | 'dismissed';
export type ReviewType = 'code' | 'configuration' | 'website' | 'message' | 'logic';
export type DeploymentRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AuthorityLevel = 'LEVEL_A' | 'LEVEL_B' | 'LEVEL_C' | 'LEVEL_D';

export interface Evidence {
  id: string;
  findingId?: string;
  organization: string; // e.g. "MITRE CWE", "OWASP", "NIST", "Node.js Documentation", "MDN"
  title: string;
  url: string;
  authorityLevel: AuthorityLevel;
  summary: string;
  verifiedDate?: string;
  cweMapping?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  findingId: string;
  question: string;
  type: 'mcq' | 'vulnerable-line' | 'scenario' | 'fix-selection';
  options: QuizOption[];
  explanation: string;
  category: 'identification' | 'reasoning' | 'fix' | 'scenario';
}

export interface LineChangeExplanation {
  code: string;
  part: string;
  explanation: string;
}

export interface Finding {
  id: string;
  reviewId: string;
  title: string;
  description: string;
  category: FindingCategory;
  severity: Severity;
  confidence: number; // 0-100
  confidenceReason?: string;
  file: string;
  lineStart: number;
  lineEnd?: number;
  vulnerableSnippet: string;
  recommendedSnippet: string;
  simpleExplanation: {
    analogy: string;
    whyCare: string;
    realWorldImpact: string[];
  };
  technicalExplanation: {
    cweId: string;
    cweTitle: string;
    mechanism: string;
    attackSurface: string[];
  };
  remediation: {
    whatChanged: string;
    whyBetter: string;
    additionalSteps: string;
    lineExplanations: LineChangeExplanation[];
  };
  practiceScenario?: {
    prompt: string;
    unsafeSnippet: string;
    safeSnippet: string;
    explanation: string;
  };
  references: Evidence[];
  quiz: QuizQuestion[];
  status: FindingStatus;
  dismissalReason?: string;
  isRedacted?: boolean;
  unmaskedValue?: string;
}

export interface ScamAdviserRating {
  domain: string;
  trustScore: number; // 1 - 100
  trustLevel: 'VERY_HIGH_RISK' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'TRUSTED';
  isUnauthorized: boolean;
  verdict: string;
  riskFactors: string[];
  positiveFactors: string[];
  scamAdviserUrl: string;
}

export interface Review {
  id: string;
  title: string;
  projectType: ReviewType;
  language: string;
  aiOrigin: string; // 'ChatGPT' | 'Claude' | 'Gemini' | 'Copilot' | 'Other' | 'Unknown'
  aiRatio?: string; // 'Entirely AI' | 'Mostly AI' | 'Partially AI' | 'Mostly human written'
  projectContext?: string;
  sourceCode: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  findings: Finding[];
  scamAdviserRating?: ScamAdviserRating;
  scores: {
    safetyScore: number; // 0 - 100
    safetyScoreSource?: string; // e.g. "ScamAdviser Trust Algorithm"
    understandingScore: number; // 0 - 100, or -1 if unverified
    groundingScore: number; // 0 - 100
    fixationRate?: number; // 0 - 100% percentage of remediated findings
    deploymentRisk: DeploymentRiskLevel;
    deploymentRiskReason: string;
  };
  checklist: {
    codeScanned: boolean;
    criticalIssuesFixed: boolean;
    understandingVerified: boolean;
    readyToDeploy: boolean;
  };
  quizAttempts: Record<string, {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    timestamp: string;
  }>;
}

export interface LearningTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  cwe: string;
  steps: {
    discover: string;
    understand: {
      summary: string;
      analogy: string;
      whyCare: string;
    };
    see: {
      unsafeCode: string;
      problemLine: number;
      explanation: string;
    };
    practice: {
      challengePrompt: string;
      sampleCode: string;
      hint: string;
      solution: string;
    };
    verify: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
    apply: string;
  };
  references: {
    title: string;
    organization: string;
    url: string;
    level: AuthorityLevel;
  }[];
}
