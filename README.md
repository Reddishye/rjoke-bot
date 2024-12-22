# RJokeBot

A fun Discord bot that brings humor to your server with various commands. Currently featuring a LinkedIn-themed joke command, with more entertaining features coming soon!

## Features

- 😄 Various humorous commands
- 🔗 Interactive buttons and links
- 💬 Perfect for adding fun to your Discord community
- 🚀 Built with Discord.js and Bun runtime

## Prerequisites

- [Bun](https://bun.sh) v1.1.36 or higher
- A Discord Application (https://discord.com/developers/applications)
- Ngrok, Nginx or anything that allows you to expose your server to the internet with SSL Certificates

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Reddishye/rjoke-bot.git
cd rjoke-bot
```

2. Install dependencies:
```bash
bun install
```

3. Configure your environment variables in a `.env` file:
```env
APP_ID=YOUR_APP_ID
PUBLIC_KEY=YOUR_PUBLIC_KEY
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
```

## Usage

1. Register slash commands:
```bash
bun run register
```

2. Start the bot:
```bash
bun run start
```

For development with hot reload:
```bash
bun run dev
```

## Available Commands

Currently available commands:
- `/linkedin` - Shows a humorous message about LinkedIn usage with a direct link

More commands are under development and will be added soon!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Collaborators

- [Redactado](https://github.com/Reddishye) - Project Creator & Maintainer

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Discord.js community
- Built with Bun - the fast all-in-one JavaScript runtime
- Special thanks to all contributors who help make this project better

## Support

If you encounter any problems or have suggestions, please open an issue in the GitHub repository.
