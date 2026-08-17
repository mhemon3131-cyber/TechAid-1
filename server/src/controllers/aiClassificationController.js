// Member 1 - Module 1 Feature 1 Controller
// AI-Powered Issue Classification (Google Gemini API + heuristic fallback)
import { classifyIssueWithAI, isGeminiConfigured } from '../services/geminiService.js';

// @desc    Analyze a reported issue and classify device category, severity,
//          complexity, and recommended support method.
// @route   POST /api/ai/classify
export const classifyIssue = async (req, res) => {
  try {
    const { description, deviceCategory } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of the issue (at least 5 characters).'
      });
    }

    const result = await classifyIssueWithAI({ description, deviceCategory });

    res.json({
      success: true,
      aiEngine: isGeminiConfigured() ? 'Google Gemini API' : 'Rule-based fallback engine',
      message: 'Issue classified successfully by the AI-Powered Issue Classification engine.',
      data: result
    });
  } catch (error) {
    console.error('Error classifying issue:', error);
    res.status(500).json({ success: false, message: 'Server error while classifying the issue.' });
  }
};
