import { Review } from '../../types/review';
import { runFullAnalysis } from '../analyzers/orchestrator';

// The exact Python code shown in the user's uploaded reference screenshot (media_1788451238758.jpg)
export const SCREENSHOT_PYTHON_DEMO = `import mysql.connector

def login(username, password):
  conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="admin123",  # <- Hardcoded password
    database="usersdb"
  )
  cursor = conn.cursor()
  query = f"SELECT * FROM users WHERE username = '{username}'"
  cursor.execute(query)
  user = cursor.fetchone()
  if user and user[2] == password:
    return "Login Success"
  return "Login Failed"
`;

// The Node.js Express demo specified in Section 82 of the user prompt
export const NODE_EXPRESS_DEMO = `const express = require("express");

const app = express();

const DB_PASSWORD = "admin123";

app.use(express.json());

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("Login:", username, password);

  if (username === "admin" && password === "password123") {
    res.json({
      success: true,
      message: "Logged in"
    });
  } else {
    res.status(401).json({
      success: false
    });
  }
});

app.listen(3000);
`;

export function getInitialDemoReview(): Review {
  // Start with the Python Login System matching the screenshot
  const review = runFullAnalysis({
    projectType: 'code',
    title: 'Code Review – Login System',
    sourceCode: SCREENSHOT_PYTHON_DEMO,
    fileName: 'login.py',
    language: 'Python',
    aiOrigin: 'ChatGPT',
    aiRatio: 'Mostly AI generated',
    projectContext: 'Database authentication service connecting to MySQL'
  });

  // Pre-seed with exact review ID as in screenshot
  review.id = 'TLR-2024-05-25-001';
  
  // Pre-calibrate scores to reflect the state shown in the reference image
  // Safety: 82%, Grounding: 90%
  review.scores.safetyScore = 82;
  review.scores.groundingScore = 90;
  review.scores.deploymentRisk = 'HIGH';
  review.scores.deploymentRiskReason = '2 critical security issues must be resolved before deployment.';

  // Simulate partial quiz completion giving 45% understanding score
  if (review.findings[0] && review.findings[0].quiz[0]) {
    const q1 = review.findings[0].quiz[0];
    const correctOpt = q1.options.find(o => o.isCorrect);
    if (correctOpt) {
      review.quizAttempts[q1.id] = {
        questionId: q1.id,
        selectedOptionId: correctOpt.id,
        isCorrect: true,
        timestamp: new Date().toISOString()
      };
      review.scores.understandingScore = 45;
    }
  }

  return review;
}
