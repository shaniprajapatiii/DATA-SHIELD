const express = require('express');
const axios = require('axios');

const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

function getLastUserMessage(messages = []) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') {
      return messages[index].content || '';
    }
  }

  return '';
}

function buildFallbackReply(userMessage) {
  const normalizedMessage = userMessage.toLowerCase();

  if (normalizedMessage.includes('risk score')) {
    return 'Risk score is a 0-100 privacy danger rating. Higher means more tracking, sharing, or weak controls.';
  }

  if (normalizedMessage.includes('permission')) {
    return 'DataShield monitors camera, mic, location, clipboard, contacts, and storage access in real time.';
  }

  if (normalizedMessage.includes('scan')) {
    return 'Use the scanner to analyze a URL or policy text. The backend returns red flags, sentiment, and a score.';
  }

  if (normalizedMessage.includes('policy') || normalizedMessage.includes('tos')) {
    return 'Policy analysis extracts data collection, sharing, retention, and compliance signals from the text.';
  }

  if (normalizedMessage.includes('free')) {
    return 'The platform exposes a privacy analysis stack, but deployment and API access depend on your local setup.';
  }

  return 'DataShield is online. Ask about risk scoring, permissions, policy analysis, or browser scanning.';
}

router.post('/', async (req, res) => {
  try {
    const { messages = [], system = '' } = req.body || {};
    const userMessage = getLastUserMessage(messages);

    if (!userMessage.trim()) {
      return res.status(400).json({ error: 'A user message is required.' });
    }

    if (!ANTHROPIC_API_KEY) {
      return res.json({
        reply: buildFallbackReply(userMessage),
        source: 'fallback',
      });
    }

    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system,
        messages: messages.map((message) => ({
          role: message.role,
          content: [{ type: 'text', text: message.content }],
        })),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        timeout: 30000,
      }
    );

    const reply = anthropicResponse.data?.content?.[0]?.text || buildFallbackReply(userMessage);

    return res.json({
      reply,
      source: 'anthropic',
    });
  } catch (error) {
    const fallbackReply = buildFallbackReply(getLastUserMessage(req.body?.messages || []));

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Chat service error',
        reply: fallbackReply,
      });
    }

    return res.status(500).json({
      error: 'Chat service unavailable',
      reply: fallbackReply,
    });
  }
});

module.exports = router;