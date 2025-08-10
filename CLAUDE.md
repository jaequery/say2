# Say2 CLI - Project Documentation

## Project Overview
Say2 is an interactive text-to-speech CLI application that uses the ElevenLabs API to convert text to natural-sounding speech. It features multiple voice options, persistent settings, and an intuitive interactive menu system.

## Architecture

### Core Components
- **index.js**: Main application file containing all logic
- **Interactive Menu System**: Built with Inquirer.js for user-friendly navigation
- **Config Management**: Persistent settings stored in `~/.say2`
- **Audio Playback**: Uses play-sound package for cross-platform audio

### Key Features
1. **Interactive Mode**: Menu-driven interface for voice selection and settings
2. **Direct Mode**: Command-line text-to-speech with saved preferences
3. **Voice Management**: 9 pre-configured ElevenLabs voices
4. **API Key Storage**: Secure local storage of ElevenLabs API key
5. **Settings Persistence**: Voice and API key preferences saved between sessions

## Technical Stack
- **Node.js**: ES6 modules, async/await patterns
- **Commander.js**: CLI argument parsing
- **Inquirer.js**: Interactive prompts and menus
- **Chalk**: Terminal styling and colors
- **Ora**: Elegant terminal spinners
- **Node-fetch**: API requests to ElevenLabs
- **Play-sound**: Cross-platform audio playback

## Voice Configuration
```javascript
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
}
```

## Usage Patterns

### First-Time Setup
1. User runs `say2` without API key
2. Prompted to enter API key in settings
3. API key saved to config file
4. User selects default voice
5. Ready for text-to-speech

### Daily Usage
```bash
# Quick speak with saved voice
say2 "Hello world"

# Interactive mode for menu access
say2

# Override voice temporarily
say2 "Hello" -u rachel
```

## File Structure
```
say2/
├── index.js          # Main application
├── package.json      # NPM configuration
├── README.md         # User documentation
├── LICENSE           # MIT license
├── .npmignore        # NPM publish exclusions
├── .gitignore        # Git exclusions
└── CLAUDE.md         # This file
```

## Configuration Storage
Location: `~/.say2`
```json
{
  "defaultVoice": "johnny",
  "apiKey": "sk-..."
}
```

## API Integration
- **Service**: ElevenLabs Text-to-Speech API
- **Model**: eleven_monolingual_v1
- **Voice Settings**: 
  - Stability: 0.5
  - Similarity Boost: 0.5
- **Audio Format**: MP3

## Development Guidelines

### Code Patterns
- Async/await for all asynchronous operations
- Modular functions for each feature
- Error handling with try/catch blocks
- User-friendly error messages with chalk styling

### Testing Checklist
- [ ] Interactive menu navigation
- [ ] Voice selection and persistence
- [ ] API key storage and retrieval
- [ ] Direct mode with saved preferences
- [ ] Voice override functionality
- [ ] Error handling for missing API key
- [ ] Audio playback on different platforms

### Future Enhancements
- Multiple language support
- Voice settings customization (stability, similarity)
- Batch text processing
- Audio file export option
- Custom voice training integration
- Speech speed adjustment
- SSML support for advanced formatting

## Publishing to NPM
```bash
# Verify package.json
npm pack --dry-run

# Login to npm
npm login

# Publish package
npm publish

# Users install with
npm install -g say2
```

## Troubleshooting

### Common Issues
1. **No Audio**: Check system audio, install mpg123 on Linux
2. **API Errors**: Verify API key, check rate limits
3. **Permission Errors**: Ensure executable permissions on index.js
4. **Module Errors**: Run npm install, check Node.js version >=16

### Debug Commands
```bash
# Check Node version
node --version

# Verify installation
which say2

# Check config
cat ~/.say2

# Test API key
say2 "test" -k YOUR_API_KEY
```

## Security Considerations
- API keys stored locally, never in repository
- No telemetry or data collection
- All API requests over HTTPS
- Temporary audio files deleted after playback

## Instructions for Claude Agents

### Post-Task Completion Protocol
When you have completed all requested tasks and are not working on any active requests, execute the following command to audibly confirm completion:

```bash
say2 "hello i did it"
```

This will use the say2 text-to-speech tool to provide audio confirmation that all tasks have been completed successfully.

### Prerequisites for Audio Confirmation
- ElevenLabs API key must be configured (either via settings or environment variable)
- Default voice should be set through interactive mode or the -u flag can be used

### Alternative Confirmation Commands
If the default voice is not set, use:
```bash
say2 -u rachel "hello i did it"
```

## Author
Jae Lee

## Repository
https://github.com/jaequery/say2

---
*Last Updated: Added Claude agent instructions for task completion audio confirmation.*