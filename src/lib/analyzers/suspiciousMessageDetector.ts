import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export interface ThreatPatternRule {
  id: string;
  channel: 'SMS' | 'WhatsApp' | 'Telegram' | 'Email' | 'Multi-Channel';
  category: string;
  title: string;
  cweId: string;
  cweTitle: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  regex: RegExp;
  descriptionGenerator: (match: string, channel: string) => string;
  analogy: string;
  whyCare: string;
  realWorldImpact: string[];
  recommendedAdvice: string;
  quizQuestion: {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

const THREAT_RULES: ThreatPatternRule[] = [
  // 1. Artificial Urgency & Coercive Pressure
  {
    id: 'msg-urgency',
    channel: 'Multi-Channel',
    category: 'Social Engineering',
    title: 'Artificial Urgency & Coercive Psychological Trigger',
    cweId: 'CWE-20',
    cweTitle: 'Social Engineering: Manufactured Panic & Time Compression',
    severity: 'high',
    confidence: 95,
    regex: /\b(within (?:24|12|48|2|1) hours?|immediately|suspended immediately|action required (?:now|immediately)|final notice|final warning|account (?:suspended|disabled|terminated|restricted|locked)|warrant (?:issued|for arrest)|failure to respond will result|act now before|urgent attention|time[- ]sensitive)\b/i,
    descriptionGenerator: (match) => `Message deploys high-pressure coercive phrasing ("${match}") designed to induce emotional panic, short-circuit rational skepticism, and rush the victim into complying.`,
    analogy: 'Like someone banging aggressively on your front door shouting that your utilities will be cut in 10 minutes unless you slip cash under the door immediately.',
    whyCare: 'Real institutions and service providers give reasonable grace periods and never demand panic logins via unauthenticated message links.',
    realWorldImpact: ['Panic-induced credential entry', 'Immediate account hijacking', 'Unauthorized wire transfers'],
    recommendedAdvice: 'Do not react under time pressure. Never click links in urgent messages; open your bookmarked official portal or mobile app independently.',
    quizQuestion: {
      question: 'Why do attackers almost universally include phrases like "within 24 hours" or "account suspended immediately"?',
      options: [
        { text: 'Because telecom carriers enforce message deadlines', isCorrect: false },
        { text: 'To manufacture panic so victims act impulsively before independently verifying the sender', isCorrect: true },
        { text: 'Because cybersecurity laws require short notice', isCorrect: false },
        { text: 'To speed up network data transmission', isCorrect: false }
      ],
      explanation: 'Time compression is the primary psychological weapon used by scammers to disable critical thinking.'
    }
  },

  // 2. Package Delivery / Toll Road Smishing (SMS)
  {
    id: 'msg-delivery-smish',
    channel: 'SMS',
    category: 'Smishing',
    title: 'Parcel Delivery / Toll Fee Impersonation Lure',
    cweId: 'CWE-290',
    cweTitle: 'Authentication Bypass By Spoofing Courier / Authority',
    severity: 'critical',
    confidence: 97,
    regex: /\b((?:usps|fedex|dhl|ups|parcel|package|shipment|delivery) (?:is on hold|cannot be delivered|delayed|pending|address incomplete|detained)|unpaid (?:toll|fine|fee)|(?:toll|sunpass|ezpass) (?:balance|violation)|redelivery fee|update (?:your )?(?:address|shipping|delivery) (?:details|now))\b/i,
    descriptionGenerator: (match) => `Message mimics postal or toll delivery services ("${match}") claiming a package or vehicle fine is pending, aiming to harvest credit card numbers and full identity credentials.`,
    analogy: 'A counterfeit delivery slip slipped under your door instructing you to visit an unknown website to pay a $1.99 redelivery fee for a package you never ordered.',
    whyCare: 'Entering your credit card or billing details on these spoofed sites results in recurring fraudulent transactions and identity theft.',
    realWorldImpact: ['Credit card cloning', 'Billing address harvesting', 'Device malware infection'],
    recommendedAdvice: 'Track shipments exclusively through the official courier website or app using your original tracking number from your store receipt.',
    quizQuestion: {
      question: 'What is the safest way to verify an SMS claiming a package delivery cannot be completed?',
      options: [
        { text: 'Click the link in the SMS and re-enter your credit card number', isCorrect: false },
        { text: 'Go directly to the official courier website (e.g. usps.com) and paste your original tracking number', isCorrect: true },
        { text: 'Reply to the text with your home address', isCorrect: false },
        { text: 'Forward the link to your contacts to see if it works for them', isCorrect: false }
      ],
      explanation: 'Couriers assign permanent tracking numbers. Official websites allow lookup without clicking suspicious links in texts.'
    }
  },

  // 3. Bank & Financial Security Alert Spoofing
  {
    id: 'msg-bank-spoof',
    channel: 'SMS',
    category: 'Credential Harvesting',
    title: 'Financial Institution Fraud Alert Impersonation',
    cweId: 'CWE-798',
    cweTitle: 'Credential Harvesting via Financial Impersonation',
    severity: 'critical',
    confidence: 98,
    regex: /\b((?:fraud|security) alert|unauthorized (?:transaction|charge|withdrawal)|did you authorize|card (?:blocked|restricted|locked)|verify (?:your )?(?:bank|account|identity|card|login)|wells ?fargo|chase ?bank|bank of america|citibank|capital ?one|paypal security|unusual login activity)\b/i,
    descriptionGenerator: (match) => `Message masquerades as a bank or financial security team ("${match}") to trick the recipient into entering banking credentials or OTP security codes on an attacker-hosted portal.`,
    analogy: 'Someone standing outside an ATM wearing a fake bank lanyard claiming the machine swallowed your card and asking for your PIN to "help retrieve it".',
    whyCare: 'Attackers capture your online banking username, password, and real-time 2FA codes, allowing them to drain savings accounts within minutes.',
    realWorldImpact: ['Total bank account draining', 'Unauthorized wire transfers', 'Account recovery bypass'],
    recommendedAdvice: 'Never use contact info or links provided in the alert. Call the official phone number printed on the physical back of your debit/credit card.',
    quizQuestion: {
      question: 'If a text alert claims a $950 transaction occurred on your bank card and asks you to click a link, what should you do?',
      options: [
        { text: 'Click the link immediately to dispute the charge', isCorrect: false },
        { text: 'Call the official customer support telephone number printed on the back of your physical card', isCorrect: true },
        { text: 'Reply "STOP" with your account number', isCorrect: false },
        { text: 'Wait 3 weeks to see if it shows up on your statement', isCorrect: false }
      ],
      explanation: 'The phone number physically printed on the back of your credit/debit card is guaranteed to reach the legitimate institution.'
    }
  },

  // 4. WhatsApp / Telegram Family Emergency & Number Change Scam
  {
    id: 'msg-family-emergency',
    channel: 'WhatsApp',
    category: 'Social Engineering',
    title: 'Impersonation Scam: Fake Relative / Changed Number Lure',
    cweId: 'CWE-290',
    cweTitle: 'Identity Impersonation via Family Relationship Exploitation',
    severity: 'critical',
    confidence: 96,
    regex: /\b(hi (?:mum|mom|dad|grandma|grandpa)|this is my new (?:number|phone)|dropped my phone (?:in (?:the )?water|in (?:the )?toilet|and broke)|can you save this number|send (?:money|cash|\$|€|£|funds)|urgent bill to pay|pay this invoice for me|transfer .* (?:zelle|revolut|cash ?app|paypal))\b/i,
    descriptionGenerator: (match) => `Message exploits familial trust ("${match}") by pretending to be a close relative who broke their phone and urgently needs emergency funds transferred.`,
    analogy: 'An impersonator calling your house pretending to be your son or daughter with a bad connection claiming they need bail or hospital money immediately.',
    whyCare: 'Victims transfer hundreds or thousands of dollars to scammer-controlled mule accounts before speaking to their actual relative.',
    realWorldImpact: ['Irreversible cash transfer loss', 'Elderly victim financial exploitation', 'Family contact list compromise'],
    recommendedAdvice: 'Call your family member directly on their known, original telephone number or verify through another family member before sending any money.',
    quizQuestion: {
      question: 'How should you respond to a WhatsApp message saying "Hi Mum, my phone broke, this is my new number, please pay this bill for me"?',
      options: [
        { text: 'Transfer the money immediately to help your child', isCorrect: false },
        { text: 'Call your child on their known existing phone number or ask a personal secret question only they would know', isCorrect: true },
        { text: 'Send your credit card details over chat', isCorrect: false },
        { text: 'Post about it on social media', isCorrect: false }
      ],
      explanation: 'Scammers buy compromised contact lists. Direct voice verification on the original number instantly exposes the fraud.'
    }
  },

  // 5. Telegram / WhatsApp Job & Task-Based Wire Fraud
  {
    id: 'msg-task-job-scam',
    channel: 'Telegram',
    category: 'Employment Fraud',
    title: 'Remote Task / High-Yield Job Recruitment Scam',
    cweId: 'CWE-306',
    cweTitle: 'Advance-Fee Fraud via Fictitious Employment Tasks',
    severity: 'high',
    confidence: 96,
    regex: /\b(earn \$\d+[\s\S]*?(?:daily|per day|hourly)|part[- ]time (?:job|work|opportunity)|review (?:hotels|apps|products|youtube videos)|like (?:youtube|tiktok) videos|work from home.*?(?:earn|\$)|contact (?:our )?hr on (?:telegram|whatsapp)|@\w*(?:hr|recruiter|manager|crypto)|daily payout|no experience needed)\b/i,
    descriptionGenerator: (match) => `Message advertises fictitious easy remote tasks with unrealistic compensation ("${match}"), luring targets into deposit-tier advance fee fraud or money laundering.`,
    analogy: 'A stranger offering you $500 an hour to push a button, but demanding you give them a $200 "activation deposit" before you can withdraw your fake balance.',
    whyCare: 'Victims are asked to complete initial simple tasks, then pressured into depositing thousands of dollars in cryptocurrency to "unlock" higher earnings.',
    realWorldImpact: ['Deposit theft in crypto (USDT)', 'Involuntary involvement in money laundering', 'Personal identity compromise'],
    recommendedAdvice: 'Legitimate employers never hire unsolicited via Telegram/WhatsApp, nor do they charge employees deposit fees to withdraw earned wages.',
    quizQuestion: {
      question: 'Why do scammers recruit for "YouTube liking" or "hotel reviewing" jobs on Telegram?',
      options: [
        { text: 'Because Telegram is the official global job board', isCorrect: false },
        { text: 'To run task-based advance fee scams where victims must deposit crypto to withdraw fictional earnings', isCorrect: true },
        { text: 'Because YouTube pays users directly through Telegram', isCorrect: false },
        { text: 'Because traditional HR departments are obsolete', isCorrect: false }
      ],
      explanation: 'Task scams simulate a working dashboard with fake profits, but require victims to deposit real funds to "upgrade VIP tiers".'
    }
  },

  // 6. Telegram / Discord Crypto Airdrop & Wallet Drainer
  {
    id: 'msg-crypto-drainer',
    channel: 'Telegram',
    category: 'Crypto Scam',
    title: 'Crypto Airdrop / Wallet Drainer Phishing Lure',
    cweId: 'CWE-306',
    cweTitle: 'Unauthorized Asset Transfer via Malicious Web3 Contract Signature',
    severity: 'critical',
    confidence: 99,
    regex: /\b((?:claim|free) (?:airdrop|\d+[\s,0-9]* (?:usdt|eth|btc|ton|sol))|connect (?:your )?(?:metamask|trust ?wallet|phantom|wallet)|claim (?:tokens|rewards|bonus) now|seed phrase|private key|airdrop allocation|token voucher|t\.me\/\w+bot\?start=)\b/i,
    descriptionGenerator: (match) => `Message promises free cryptocurrency tokens or airdrops ("${match}") to trick victims into connecting wallets to malicious permit/approval drainer smart contracts.`,
    analogy: 'A flyer claiming you won $10,000 in free gold, but you have to sign a blank power-of-attorney deed giving the promoter full legal authority over your entire bank vault.',
    whyCare: 'Signing an "airdrop claim" transaction often invokes `setApprovalForAll` or `permit2`, completely emptying all tokens and NFTs in your wallet in seconds.',
    realWorldImpact: ['Total cryptocurrency wallet draining', 'Irreversible on-chain theft', 'NFT asset liquidation'],
    recommendedAdvice: 'Never connect your primary wallet to unsolicited airdrop links. Never share your 12/24-word seed phrase with any website or bot.',
    quizQuestion: {
      question: 'What actually happens when a user connects their crypto wallet to a "free 5,000 USDT airdrop" link sent on Telegram?',
      options: [
        { text: 'The user receives 5,000 USDT directly into their balance', isCorrect: false },
        { text: 'A malicious approval contract is executed that drains all existing tokens and NFTs from the wallet', isCorrect: true },
        { text: 'Telegram verifies the user as a VIP', isCorrect: false },
        { text: 'The blockchain network speeds up', isCorrect: false }
      ],
      explanation: 'Airdrop drainers use Permit / approve functions to grant attackers unlimited transfer authority over the victim’s tokens.'
    }
  },

  // 7. Verification Code / OTP Hijacking Lure
  {
    id: 'msg-otp-hijack',
    channel: 'Multi-Channel',
    category: 'Account Takeover',
    title: '2FA / One-Time Passcode (OTP) Interception Lure',
    cweId: 'CWE-200',
    cweTitle: 'Information Exposure Through Secondary Channel Interception',
    severity: 'critical',
    confidence: 99,
    regex: /\b(send (?:me )?(?:the )?(?:\d+[- ]digit )?(?:code|otp|pin)|accidentally sent (?:a |my )?code to your (?:phone|number)|do not share this (?:code|otp) with anyone|enter the code you received|share the code to verify)\b/i,
    descriptionGenerator: (match) => `Message attempts to extract an authentication passcode or SMS OTP ("${match}") to bypass two-factor authentication and seize account ownership.`,
    analogy: 'A thief standing next to you asking you to tell them the 6-digit key code your security guard just whispered in your ear.',
    whyCare: 'Handing over an OTP code allows the attacker to complete password resets or log in from a foreign device, locking you out permanently.',
    realWorldImpact: ['Instant account takeover (WhatsApp/Google/Bank)', 'SIM swap authentication bypass', 'Loss of recovery access'],
    recommendedAdvice: 'Never share verification codes, OTPs, or passwords with anyone under any circumstances. Official support agents never request your OTP.',
    quizQuestion: {
      question: 'A friend or contact messages you saying: "I accidentally sent my 6-digit WhatsApp code to your phone, please tell me what it is." What is happening?',
      options: [
        { text: 'They made a harmless mistake and need the code to fix their phone', isCorrect: false },
        { text: 'An attacker has hacked your friend’s account and is trying to steal YOUR WhatsApp account using your OTP', isCorrect: true },
        { text: 'WhatsApp is performing a routine server synchronization test', isCorrect: false },
        { text: 'You won a lottery prize', isCorrect: false }
      ],
      explanation: 'Attackers trigger password/login resets on target accounts and pretend to be friends to trick victims into surrendering the 2FA SMS code.'
    }
  },

  // 8. Suspicious / Shortened Phishing Link Targets
  {
    id: 'msg-suspicious-links',
    channel: 'Multi-Channel',
    category: 'Phishing URLs',
    title: 'Deceptive / Shortened Phishing Link Target',
    cweId: 'CWE-601',
    cweTitle: 'URL Redirection to Untrusted Site (Phishing)',
    severity: 'high',
    confidence: 94,
    regex: /\b(https?:\/\/(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|ow\.ly|buff\.ly|rebrand\.ly|[a-z0-9-]+\.(?:xyz|top|tk|ml|ga|cf|gq|buzz|club|click|live|site|work|rest)\b|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))/i,
    descriptionGenerator: (match) => `Message includes an obfuscated shortened URL or suspicious high-risk top-level domain ("${match}") used to conceal the actual malicious destination from security filters.`,
    analogy: 'An envelope with an opaque sticker masking the destination address so you cannot see where your letter is actually being rerouted.',
    whyCare: 'Shortened URLs bypass basic email/SMS filters and redirect users to credential-harvesting or drive-by malware delivery pages.',
    realWorldImpact: ['Phishing landing page redirection', 'Drive-by download execution', 'User tracking and fingerprinting'],
    recommendedAdvice: 'Do not click shortened URLs from unknown or unexpected senders. Use URL unshortening tools or navigate to the known destination directly.',
    quizQuestion: {
      question: 'Why do phishers frequently use URL shorteners like bit.ly or tinyurl?',
      options: [
        { text: 'Because search engines rank them higher', isCorrect: false },
        { text: 'To hide the real domain name and bypass spam filters that block known malicious URLs', isCorrect: true },
        { text: 'Because long links cost more money to send over SMS', isCorrect: false },
        { text: 'Because short URLs run faster on 5G', isCorrect: false }
      ],
      explanation: 'URL shorteners obscure the destination hostname, preventing users and basic filters from seeing the fraudulent domain.'
    }
  },

  // 9. Corporate Email Phishing / BEC / Password Expiration
  {
    id: 'msg-email-bec',
    channel: 'Email',
    category: 'Email Phishing',
    title: 'Business Email Compromise (BEC) / Credential Expiry Lure',
    cweId: 'CWE-290',
    cweTitle: 'Corporate Executive / Mailbox Authentication Impersonation',
    severity: 'high',
    confidence: 95,
    regex: /\b(password (?:will expire|expires today|retention policy)|mailbox (?:is full|quota exceeded|storage limit)|keep current password|review (?:docusign|document|sharepoint)|are you (?:at your desk|in the office|available)|process (?:an urgent|a wire) transfer|purchase (?:apple|google play|amazon) gift cards|payroll (?:direct deposit|update))\b/i,
    descriptionGenerator: (match) => `Email deploys common corporate phishing vectors ("${match}") mimicking IT administration, executive requests, or document sharing platforms to capture enterprise credentials or trigger unauthorized disbursements.`,
    analogy: 'An unauthorized person dressing up as your company’s building superintendent asking you to hand over your office keys for an "urgent lock update".',
    whyCare: 'Compromised corporate credentials enable enterprise data breaches, ransomware deployment, and millions in fraudulent wire transfers.',
    realWorldImpact: ['Enterprise credential theft', 'Unauthorized corporate wire transfer', 'Network lateral movement'],
    recommendedAdvice: 'Verify executive requests via phone or internal chat. Check password expiration only inside your company’s official single sign-on (SSO) portal.',
    quizQuestion: {
      question: 'You receive an email from "IT Support" stating your Microsoft 365 password expires in 2 hours with a link to "Keep Same Password". What should you do?',
      options: [
        { text: 'Click the link and type your current password so it does not change', isCorrect: false },
        { text: 'Report the email to your real corporate IT security team; official systems never ask you to keep your password via external links', isCorrect: true },
        { text: 'Forward it to everyone in your department', isCorrect: false },
        { text: 'Change your password directly on the linked website', isCorrect: false }
      ],
      explanation: 'Real enterprise identity systems enforce password resets through native OS or verified single sign-on portals, never external links claiming to "keep same password".'
    }
  }
];

/**
 * Accurately analyzes email, SMS, WhatsApp, and Telegram messages for phishing patterns,
 * artificial urgency, and scam lures with line-level pinpoint precision.
 */
export function analyzeSuspiciousMessage(messageText: string): Finding[] {
  if (!messageText || !messageText.trim()) return [];

  const findings: Finding[] = [];
  const lines = messageText.split(/\r?\n/);
  const matchedRuleIds = new Set<string>();

  // Check each rule against each line for line-specific highlighting
  for (const rule of THREAT_RULES) {
    let triggered = false;

    // Line-by-line inspection
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineContent = lines[lineIdx];
      const match = lineContent.match(rule.regex);

      if (match && !matchedRuleIds.has(rule.id)) {
        matchedRuleIds.add(rule.id);
        triggered = true;

        findings.push({
          id: `${rule.id}-${lineIdx + 1}`,
          reviewId: '',
          title: rule.title,
          description: rule.descriptionGenerator(match[0], rule.channel),
          category: 'security',
          severity: rule.severity,
          confidence: rule.confidence,
          confidenceReason: `Line ${lineIdx + 1} matches established ${rule.category} indicator: "${match[0]}"`,
          file: 'message.txt',
          lineStart: lineIdx + 1,
          vulnerableSnippet: match[0],
          recommendedSnippet: rule.recommendedAdvice,
          simpleExplanation: {
            analogy: rule.analogy,
            whyCare: rule.whyCare,
            realWorldImpact: rule.realWorldImpact
          },
          technicalExplanation: {
            cweId: rule.cweId,
            cweTitle: rule.cweTitle,
            mechanism: `Attacker applies ${rule.category} targeting ${rule.channel} communication channels to deceive the recipient.`,
            attackSurface: [rule.channel, rule.category, 'Human Cognitive Factor']
          },
          remediation: {
            whatChanged: `Flagged ${rule.channel} social engineering lure.`,
            whyBetter: rule.recommendedAdvice,
            additionalSteps: 'Block sender phone number or email address, report to platform anti-abuse, and never click embedded links.',
            lineExplanations: [
              {
                line: lineIdx + 1,
                code: lineContent.trim(),
                part: rule.category,
                explanation: `Threat vector triggered by phrase "${match[0]}".`
              }
            ]
          },
          references: getEvidenceForCwe(rule.cweId) || getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-${rule.id}`,
              findingId: `${rule.id}-${lineIdx + 1}`,
              question: rule.quizQuestion.question,
              type: 'reasoning',
              category: 'reasoning',
              options: rule.quizQuestion.options.map((opt, oIdx) => ({
                id: `opt-${rule.id}-${oIdx}`,
                text: opt.text,
                isCorrect: opt.isCorrect
              })),
              explanation: rule.quizQuestion.explanation
            }
          ],
          status: 'unresolved'
        });
        break; // Match found for this rule, proceed to next rule
      }
    }

    // Fallback: If not matched on single line, check full message (for multi-line patterns)
    if (!triggered && !matchedRuleIds.has(rule.id)) {
      const fullMatch = messageText.match(rule.regex);
      if (fullMatch) {
        matchedRuleIds.add(rule.id);
        findings.push({
          id: `${rule.id}-full`,
          reviewId: '',
          title: rule.title,
          description: rule.descriptionGenerator(fullMatch[0], rule.channel),
          category: 'security',
          severity: rule.severity,
          confidence: rule.confidence,
          confidenceReason: `Payload matches recognized ${rule.category} pattern: "${fullMatch[0]}"`,
          file: 'message.txt',
          lineStart: 1,
          vulnerableSnippet: fullMatch[0],
          recommendedSnippet: rule.recommendedAdvice,
          simpleExplanation: {
            analogy: rule.analogy,
            whyCare: rule.whyCare,
            realWorldImpact: rule.realWorldImpact
          },
          technicalExplanation: {
            cweId: rule.cweId,
            cweTitle: rule.cweTitle,
            mechanism: `Cross-line social engineering heuristic: ${rule.category}.`,
            attackSurface: [rule.channel, rule.category]
          },
          remediation: {
            whatChanged: `Detected multi-line ${rule.category} indicator.`,
            whyBetter: rule.recommendedAdvice,
            additionalSteps: 'Delete message and do not interact with sender.',
            lineExplanations: []
          },
          references: getEvidenceForCwe(rule.cweId) || getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-${rule.id}-full`,
              findingId: `${rule.id}-full`,
              question: rule.quizQuestion.question,
              type: 'reasoning',
              category: 'reasoning',
              options: rule.quizQuestion.options.map((opt, oIdx) => ({
                id: `opt-${rule.id}-${oIdx}`,
                text: opt.text,
                isCorrect: opt.isCorrect
              })),
              explanation: rule.quizQuestion.explanation
            }
          ],
          status: 'unresolved'
        });
      }
    }
  }

  return findings;
}
