


const express = require('express');
const router = express.Router();
// Import the authentication middleware
const {
  getAllPrompts,
  getPromptById,
  savePrompt,
  updatePrompt,
  executePrompt,
  getUserPrompts,
  deletePromptById
} = require('../controller/promptController');

// Apply the middleware to protect these routes
router.get('/userprompts', getUserPrompts);
router.get('/prompts/:id', getPromptById);
router.post('/prompts/:id/execute', executePrompt);


module.exports = router;