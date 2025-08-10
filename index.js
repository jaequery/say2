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
  'johnny': 'pNInz6obpgDQGcFmaJgB',
  'rachel': '21m00Tcm4TlvDq8ikWAM',
  'bella': 'EXAVITQu4vr4xnSDxMaL',
  'josh': 'TxGEqnHWrfWFTfGW9XjX',
  'arnold': 'VR6AewLTigWG4xSOukaG',
  'adam': 'pNInz6obpgDQGcFmaJgB',
  'antoni': 'ErXwobaYiN019PkySvjV',
  'elli': 'MF3mGyEYCl7XYWbV9V6O',
  'sam': 'yoZ06aMxZJJ28mfd3POQ'
};

const configPath = path.join(os.homedir(), '.say2config.json');

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
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.buffer();
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
  
  const choices = [
    { name: '🎭 Choose Voice', value: 'voice' },
    { name: '🔊 Speak Text', value: 'speak' },
    { name: '⚙️  Settings', value: 'settings' },
    { name: '❌ Exit', value: 'exit' }
  ];
  
  if (config.defaultVoice) {
    choices.splice(1, 0, { 
      name: chalk.green(`🚀 Quick Speak (using ${config.defaultVoice})`), 
      value: 'quick' 
    });
  }
  
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
  
  console.log(chalk.cyan('\n🎭 Available Voices:\n'));
  
  const voiceChoices = Object.keys(voices).map(voice => ({
    name: voice === config.defaultVoice ? chalk.green(`${voice} ✓ (current)`) : voice,
    value: voice
  }));
  
  const { selectedVoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedVoice',
      message: 'Select a voice:',
      choices: voiceChoices,
      pageSize: 10
    }
  ]);
  
  const { setDefault } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setDefault',
      message: `Set ${selectedVoice} as your default voice?`,
      default: true
    }
  ]);
  
  if (setDefault) {
    config.defaultVoice = selectedVoice;
    saveConfig(config);
    console.log(chalk.green(`✓ ${selectedVoice} set as default voice`));
  }
  
  return selectedVoice;
}

async function speakText(voiceName, apiKey) {
  const { text } = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: 'Enter text to speak:',
      validate: input => input.trim() ? true : 'Please enter some text'
    }
  ]);
  
  const voiceId = voices[voiceName];
  const spinner = ora(`Speaking with ${voiceName}'s voice...`).start();
  
  try {
    const audioBuffer = await textToSpeech(text, voiceId, apiKey);
    spinner.succeed('Audio generated');
    await playAudio(audioBuffer);
    console.log(chalk.green('✓ Done!'));
  } catch (error) {
    spinner.fail('Failed to speak');
    throw error;
  }
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
        
      case 'quick':
        if (config.defaultVoice) {
          await speakText(config.defaultVoice, apiKey);
        }
        break;
        
      case 'speak':
        const voiceName = config.defaultVoice || await selectVoice();
        await speakText(voiceName, apiKey);
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
  
  const voiceId = voices[config.defaultVoice];
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
  .version('1.0.0')
  .argument('[text]', 'Text to speak (if not provided, enters interactive mode)')
  .option('-u, --user <voice>', 'Voice to use (overrides default)')
  .option('-k, --api-key <key>', 'ElevenLabs API key (or save it in settings)')
  .option('-l, --list-voices', 'List available voices')
  .action(async (text, options) => {
    if (options.listVoices) {
      console.log(chalk.cyan('Available voices:'));
      Object.keys(voices).forEach(voice => {
        console.log(`  - ${voice}`);
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
        const voiceId = voices[voiceName];
        
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