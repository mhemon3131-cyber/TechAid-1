// Member 1 - Module 2 Feature 1 Controller
// Interactive AI Troubleshooting Assistant (Google Gemini API + heuristic fallback)
import { chatWithTroubleshootAssistant, isGeminiConfigured } from '../services/geminiService.js';

// @desc    Send the conversation so far and get the assistant's next
//          troubleshooting step / follow-up question.
// @route   POST /api/ai/troubleshoot
export const troubleshootChat = async (req, res) => {
  try {
    const { deviceCategory, description, messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a conversation (messages array with at least one entry).'
      });
    }

    const result = await chatWithTroubleshootAssistant({ deviceCategory, description, messages });

    res.json({
      success: true,
      aiEngine: isGeminiConfigured() ? 'Google Gemini API' : 'Rule-based fallback engine',
      data: result
    });
  } catch (error) {
    console.error('Error in AI troubleshooting assistant:', error);
    res.status(500).json({ success: false, message: 'Server error in the troubleshooting assistant.' });
  }
};
