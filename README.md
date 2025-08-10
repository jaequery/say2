# Say2 CLI

An interactive text-to-speech command-line interface powered by ElevenLabs API. Features multiple voice options, persistent settings, and an intuitive menu system.

## Features

- 🎭 **Multiple Voices**: Choose from 24 different voices with various accents and personalities
- 💾 **Persistent Settings**: Save your preferred voice and API key for quick access
- 🎨 **Interactive Menu**: User-friendly interface with colorful menus
- ⚡ **Quick Mode**: Speak text instantly with saved preferences
- 🔐 **Secure API Key Storage**: Store your ElevenLabs API key locally

## Installation

```bash
npm install -g say2
```

## Usage

### Interactive Mode
Run without arguments to enter the interactive menu:
```bash
say2
```

This opens a menu where you can:
- Choose and save a default voice
- Enter text to speak
- Manage your API key and settings
- Use Quick Speak with your saved voice

### Direct Mode
Speak text directly using your saved voice:
```bash
say2 "Hello, world!"
```

### Override Voice
Use a specific voice for one-time use:
```bash
say2 "Hello!" -u rachel
```

### List Available Voices
```bash
say2 -l
```

## First Time Setup

1. **Get an API Key**: Sign up at [ElevenLabs](https://elevenlabs.io) to get your API key

2. **Run Say2**: 
   ```bash
   say2
   ```

3. **Configure Settings**: 
   - Go to Settings → Set API Key
   - Enter your ElevenLabs API key (it will be saved securely)
   - Choose your default voice

4. **Start Speaking**: 
   ```bash
   say2 "Your text here"
   ```

## Configuration

Settings are stored in `~/.say2` including:
- Default voice preference
- ElevenLabs API key

## Command Options

```
Options:
  -u, --user <voice>    Voice to use (overrides default)
  -k, --api-key <key>   ElevenLabs API key (temporary override)
  -l, --list-voices     List available voices
  -h, --help           Display help
  -V, --version        Display version
```

## Available Voices

- **johnny** - Male, American, casual
- **rachel** - Female, warm, professional
- **bella** - Female, soft, gentle
- **josh** - Male, deep, confident
- **arnold** - Male, strong, authoritative
- **adam** - Male, middle-aged, clear
- **antoni** - Male, well-rounded, smooth
- **elli** - Female, young, bright
- **sam** - Male, raspy, character
- **domi** - Female, confident, mature
- **dave** - Male, British, conversational
- **fin** - Male, Irish, friendly
- **sarah** - Female, American, news
- **charlie** - Male, casual, relaxed
- **emily** - Female, calm, soothing
- **charlotte** - Female, seductive, sultry
- **matilda** - Female, warm, motherly
- **matthew** - Male, deep, narrator
- **james** - Male, Australian, calm
- **joseph** - Male, British, articulate
- **harry** - Male, anxious, nervous
- **dorothy** - Female, elderly, wise
- **george** - Male, British, warm

## Requirements

- Node.js 16.0.0 or higher
- ElevenLabs API key (free tier available)
- Audio playback capability on your system

## Troubleshooting

### No sound playing?
- Ensure your system has audio playback capability
- Check volume settings
- On Linux, you may need to install `mpg123` or `mplayer`

### API Key issues?
- Verify your API key is correct in Settings
- Check your ElevenLabs account for API limits
- Ensure you have an active internet connection

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/jaequery/say2).