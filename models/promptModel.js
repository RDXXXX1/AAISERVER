
const mongoose = require('mongoose');

// Define the schema for variables
const variableSchema = new mongoose.Schema({
  name: { type: String, required: true },
   // Optional
});

// Define the schema for prompts
const promptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  description: { type: String, required: false },
  variables: [variableSchema], 
  visibility: { type: Boolean ,default: false } 
});

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
