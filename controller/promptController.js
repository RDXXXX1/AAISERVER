
require('dotenv').config();
const Prompt = require('../models/promptModel');
const User = require('../models/User');  // Ensure the User model is imported
const { OpenAI } = require('openai');
const APIKEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: APIKEY });

// Function to replace placeholders in the prompt template with actual values
const fillPromptVariables = (promptTemplate, variables) => {
  console.log('Filling prompt variables:', { promptTemplate, variables });
  let filledPrompt = promptTemplate;

  variables.forEach(variable => {
    const regex = new RegExp(`\\[${variable.name}\\]`, 'g');
    filledPrompt = filledPrompt.replace(regex, variable.value || '');
  });

  console.log('Filled prompt:', filledPrompt);
  return filledPrompt;
};

// Function to send the filled prompt to ChatGPT and get the response
const sendPromptToChatGPT = async (filledPrompt, userId) => {
  try {
    console.log('Sending prompt to ChatGPT:', filledPrompt);
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: filledPrompt }],
      max_tokens: 400
    });
    
    const inputTokens = response.usage.prompt_tokens;  // Tokens used for the input (prompt)
    const outputTokens = response.usage.completion_tokens;  // Tokens used for the output (response)
    const totalTokens = response.usage.total_tokens;  // Total tokens used (input + output)

    // Update the user's tokens in the database
    console.log(`Updating tokens for user ${userId}: ${totalTokens} total tokens used.`);
    await User.findByIdAndUpdate(userId, {
      $inc: {
        inputToken: inputTokens,
        outputToken: outputTokens,
        totalToken: totalTokens
      }
    });

    console.log('ChatGPT response:', response);

    return {
      content: response.choices[0].message.content.trim(),
      totalTokens
    };

  } catch (error) {
    console.error('Failed to get response from ChatGPT:', error);
    throw new Error('Failed to get response from ChatGPT');
  }
};

// Get all prompts from the database
const getAllPrompts = async (req, res) => {
  try {
    console.log('Fetching all prompts from database.');
    const prompts = await Prompt.find();
    console.log('Fetched prompts:', prompts);
    res.status(200).json(prompts);
  } catch (error) {
    console.error('Server error while fetching all prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all prompts with visibility set to true from the database for user
const getUserPrompts = async (req, res) => {
  try {
    console.log('Fetching visible prompts for user.');
    const visiblePrompts = await Prompt.find({ visibility: true });
    console.log('Fetched visible prompts:', visiblePrompts);
    res.status(200).json(visiblePrompts);
  } catch (error) {
    console.error('Server error while fetching visible prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single prompt by ID from the database
const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching prompt by ID: ${id}`);
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      console.log('Prompt not found');
      return res.status(404).json({ message: 'Prompt not found' });
    }
    console.log('Fetched prompt:', prompt);
    res.status(200).json(prompt);
  } catch (error) {
    console.error('Server error while fetching prompt by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Execute a prompt by ID with given variables
const executePrompt = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the prompt to be executed
    const { variables } = req.body; // Variables to fill the prompt
    console.log(`Executing prompt by ID: ${id} with variables:`, variables);

    const userId = req.user.id; // Extract the user ID from the JWT
    console.log("User ID:", userId); // Debugging statement to check the user ID

    const prompt = await Prompt.findById(id); // Find the prompt by ID
    if (!prompt) {
      console.log('Prompt not found');
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const filledPrompt = fillPromptVariables(prompt.prompt, variables); // Fill the prompt template with the provided variables
    const chatGPTResponse = await sendPromptToChatGPT(filledPrompt, userId); // Pass the correct user ID to the function

    console.log('ChatGPT response:', chatGPTResponse); // Log the response from ChatGPT
    res.status(200).json({ response: chatGPTResponse }); // Return the response to the frontend
  } catch (error) {
    console.error('Server error while executing prompt:', error); // Handle any errors
    res.status(500).json({ message: 'Server error' }); // Return a server error response
  }
};
module.exports = { getAllPrompts, getPromptById, executePrompt, getUserPrompts};
   