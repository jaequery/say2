#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import player from 'play-sound';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

const voices = {
  // Free premade voices (available on all plans)
  'roger':   { id: 'CwhRBWXzGAHq8TQ4Fs17', desc: 'male, american, laid-back casual', free: true },
  'sarah':   { id: 'EXAVITQu4vr4xnSDxMaL', desc: 'female, american, reassuring', free: true },
  'laura':   { id: 'FGY2WhTYpPnrIDTdsKH5', desc: 'female, american, quirky enthusiast', free: true },
  'charlie': { id: 'IKne3meq5aSn9XLyUdCD', desc: 'male, australian, confident', free: true },
  'george':  { id: 'JBFqnCBsd6RMkjVDRZzb', desc: 'male, british, warm storyteller', free: true },
  'callum':  { id: 'N2lVS1w4EtoT3dr4eOWO', desc: 'male, american, husky trickster', free: true },
  'river':   { id: 'SAz9YHcvj6GT2YYXdXww', desc: 'neutral, american, relaxed informative', free: true },
  'harry':   { id: 'SOYHLrjzK2X1ezoPC6cr', desc: 'male, american, fierce warrior', free: true },
  'liam':    { id: 'TX3LPaxmHKxFdv7VOQHJ', desc: 'male, american, energetic', free: true },
  'alice':   { id: 'Xb7hH8MSUJpSbSDYk0k2', desc: 'female, british, clear educator', free: true },
  'matilda': { id: 'XrExE9yKIg1WjnnlVkGX', desc: 'female, american, professional', free: true },
  'will':    { id: 'bIHbv24MWmeRgasZH58o', desc: 'male, american, relaxed optimist', free: true },
  'jessica': { id: 'cgSgspJ2msm6clMCkdW9', desc: 'female, american, playful bright', free: true },
  'eric':    { id: 'cjVigY5qzO86Huf0OWal', desc: 'male, american, smooth trustworthy', free: true },
  'bella':   { id: 'hpp4J3VqNfWAUOO0d1Us', desc: 'female, american, professional bright', free: true },
  'chris':   { id: 'iP95p4xoKVk53GoZ742B', desc: 'male, american, charming', free: true },
  'brian':   { id: 'nPczCjzI2devNBz1zQrb', desc: 'male, american, deep comforting', free: true },
  'daniel':  { id: 'onwK4e9ZLuTAKqWW03F9', desc: 'male, british, steady broadcaster', free: true },
  'lily':    { id: 'pFZP5JQG7iQjIQuC4Bku', desc: 'female, british, velvety actress', free: true },
  'adam':    { id: 'pNInz6obpgDQGcFmaJgB', desc: 'male, american, dominant firm', free: true },
  'bill':    { id: 'pqHfZKP75CvOlQylNhV4', desc: 'male, american, wise mature', free: true },
};


const configPath = path.join(os.homedir(), '.say2');

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not load config file'));
  }
  return {};
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not save config file'));
  }
}

async function textToSpeech(text, voiceId, apiKey) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorBody = await response.json();
      errorDetail = errorBody.detail?.message || JSON.stringify(errorBody.detail) || errorDetail;
    } catch (e) {
      // fall back to statusText
    }
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorDetail}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

async function playAudio(buffer) {
  const tempFile = path.join(process.cwd(), `.say2_temp_${Date.now()}.mp3`);
  
  fs.writeFileSync(tempFile, buffer);
  
  return new Promise((resolve, reject) => {
    const audioPlayer = player();
    audioPlayer.play(tempFile, (err) => {
      fs.unlinkSync(tempFile);
      if (err) reject(err);
      else resolve();
    });
  });
}

async function showMainMenu() {
  const config = loadConfig();
  
  console.log(chalk.cyan('\n🎙️  Say2 - Text to Speech CLI\n'));
  
  if (config.defaultVoice) {
    console.log(chalk.gray(`Current voice: ${config.defaultVoice}\n`));
  }
  
  const choices = [
    { name: '🎭 Choose Voice', value: 'voice' },
    { name: '⚙️  Settings', value: 'settings' },
    { name: '❌ Exit', value: 'exit' }
  ];
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);
  
  return action;
}

async function selectVoice() {
  const config = loadConfig();
  const apiKey = config.apiKey;
  
  if (!apiKey) {
    console.log(chalk.yellow('\n⚠️  API key required to test voices. Please set one in Settings first.\n'));
    return null;
  }
  
  console.log(chalk.cyan('\n🎭 Available Voices:\n'));
  
  let continueSelecting = true;
  let selectedVoice = null;
  
  while (continueSelecting) {
    const voiceChoices = Object.keys(voices).map(voice => {
      const voiceInfo = voices[voice];
      const tag = voiceInfo.free ? chalk.green('[free]') : chalk.yellow('[paid]');
      const displayName = voice === config.defaultVoice
        ? chalk.green(`${voice} ✓ (current)`) + ` ${tag} - ${chalk.gray(voiceInfo.desc)}`
        : `${voice} ${tag} - ${chalk.gray(voiceInfo.desc)}`;
      return {
        name: displayName,
        value: voice
      };
    });
    
    voiceChoices.push({ name: chalk.gray('← Cancel'), value: 'cancel' });
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Select a voice:',
        choices: voiceChoices,
        pageSize: 11
      }
    ]);
    
    if (choice === 'cancel') {
      return null;
    }
    
    selectedVoice = choice;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Voice: ${selectedVoice}`,
        choices: [
          { name: '🔊 Test this voice', value: 'test' },
          { name: '💾 Save as default', value: 'save' },
          { name: '← Back to voices', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'test':
        const testPhrases = [
          `Hello! This is ${selectedVoice}'s voice.`,
          `Hi there! I'm ${selectedVoice}, nice to meet you!`,
          `Testing, testing, one two three. This is ${selectedVoice} speaking.`
        ];
        const testText = testPhrases[Math.floor(Math.random() * testPhrases.length)];
        
        const spinner = ora(`Testing ${selectedVoice}'s voice...`).start();
        try {
          const voiceId = voices[selectedVoice].id;
          const audioBuffer = await textToSpeech(testText, voiceId, apiKey);
          spinner.succeed('Playing voice sample');
          await playAudio(audioBuffer);
          console.log(chalk.green('✓ Voice test complete'));
        } catch (error) {
          spinner.fail('Failed to test voice');
          console.error(chalk.red('Error:', error.message));
        }
        break;
        
      case 'save':
        config.defaultVoice = selectedVoice;
        saveConfig(config);
        console.log(chalk.green(`✓ ${selectedVoice} set as default voice`));
        continueSelecting = false;
        break;
        
      case 'back':
        // Loop continues to show voice list again
        break;
    }
  }
  
  return selectedVoice;
}


async function showSettings() {
  const config = loadConfig();
  
  console.log(chalk.cyan('\n⚙️  Settings\n'));
  console.log(`Default Voice: ${config.defaultVoice || chalk.gray('Not set')}`);
  console.log(`API Key: ${config.apiKey ? chalk.green('✓ Saved') : chalk.gray('Not set (using env variable or -k option)')}`);
  console.log(`Config Location: ${configPath}`);
  
  const choices = [
    { name: '🔑 Set API Key', value: 'setApiKey' },
    { name: '🔄 Reset Default Voice', value: 'resetVoice' }
  ];
  
  if (config.apiKey) {
    choices.push({ name: '🗑️  Remove API Key', value: 'removeApiKey' });
  }
  
  choices.push({ name: '← Back', value: 'back' });
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);
  
  switch (action) {
    case 'setApiKey':
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your ElevenLabs API key:',
          mask: '*',
          validate: input => input.trim() ? true : 'API key cannot be empty'
        }
      ]);
      config.apiKey = apiKey.trim();
      saveConfig(config);
      console.log(chalk.green('✓ API key saved'));
      break;
      
    case 'removeApiKey':
      delete config.apiKey;
      saveConfig(config);
      console.log(chalk.green('✓ API key removed'));
      break;
      
    case 'resetVoice':
      delete config.defaultVoice;
      saveConfig(config);
      console.log(chalk.green('✓ Default voice reset'));
      break;
  }
}

async function interactiveMode() {
  let running = true;
  
  while (running) {
    const config = loadConfig();
    const apiKey = config.apiKey;
    
    if (!apiKey) {
      console.log(chalk.yellow('\n⚠️  No API key found. Please set one in Settings.\n'));
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '⚙️  Go to Settings', value: 'settings' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);
      
      if (action === 'exit') {
        running = false;
        console.log(chalk.cyan('\n👋 Goodbye!\n'));
      } else {
        await showSettings();
      }
      continue;
    }
    
    const action = await showMainMenu();
    
    switch (action) {
      case 'voice':
        await selectVoice();
        break;
        
      case 'settings':
        await showSettings();
        break;
        
      case 'exit':
        running = false;
        console.log(chalk.cyan('\n👋 Goodbye!\n'));
        break;
    }
  }
}

async function directSpeak(text, providedApiKey) {
  const config = loadConfig();
  const apiKey = providedApiKey || config.apiKey;
  
  if (!config.defaultVoice) {
    console.log(chalk.yellow('No default voice set. Please run "say2" to select one.'));
    process.exit(1);
  }
  
  if (!apiKey) {
    console.log(chalk.yellow('No API key found. Please run "say2" to set one in settings.'));
    process.exit(1);
  }
  
  const voiceId = voices[config.defaultVoice].id;
  const spinner = ora(`Speaking with ${config.defaultVoice}'s voice...`).start();
  
  try {
    const audioBuffer = await textToSpeech(text, voiceId, apiKey);
    spinner.stop();
    await playAudio(audioBuffer);
  } catch (error) {
    spinner.fail('Failed to speak');
    throw error;
  }
}

program
  .name('say2')
  .description('Enhanced text-to-speech CLI with multiple voices using ElevenLabs')
  .version(JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version)
  .argument('[text]', 'Text to speak (if not provided, enters interactive mode)')
  .option('-u, --user <voice>', 'Voice to use (overrides default)')
  .option('-k, --api-key <key>', 'ElevenLabs API key (or save it in settings)')
  .option('-l, --list-voices', 'List available voices')
  .action(async (text, options) => {
    if (options.listVoices) {
      console.log(chalk.cyan('Available voices:'));
      Object.keys(voices).forEach(voice => {
        const voiceInfo = voices[voice];
        const tag = voiceInfo.free ? chalk.green('[free]') : chalk.yellow('[paid]');
        console.log(`  - ${voice} ${tag} ${chalk.gray('(' + voiceInfo.desc + ')')}`);
      });
      process.exit(0);
    }

    const config = loadConfig();
    const apiKey = options.apiKey || config.apiKey;
    
    if (text) {
      if (!apiKey) {
        console.error(chalk.red('Error: ElevenLabs API key is required.'));
        console.error('Set it with -k option or run "say2" to set it in settings');
        process.exit(1);
      }
      
      if (options.user) {
        const voiceName = options.user.toLowerCase();
        const voiceId = voices[voiceName] ? voices[voiceName].id : null;
        
        if (!voiceId) {
          console.error(chalk.red(`Error: Voice "${options.user}" not found.`));
          console.error('Available voices:', Object.keys(voices).join(', '));
          process.exit(1);
        }
        
        const spinner = ora(`Speaking with ${voiceName}'s voice...`).start();
        try {
          const audioBuffer = await textToSpeech(text, voiceId, apiKey);
          spinner.stop();
          await playAudio(audioBuffer);
        } catch (error) {
          spinner.fail('Failed to speak');
          console.error(chalk.red('Error:', error.message));
          process.exit(1);
        }
      } else {
        try {
          await directSpeak(text, apiKey);
        } catch (error) {
          console.error(chalk.red('Error:', error.message));
          process.exit(1);
        }
      }
    } else {
      try {
        await interactiveMode();
      } catch (error) {
        console.error(chalk.red('Error:', error.message));
        process.exit(1);
      }
    }
  });

program.parse();