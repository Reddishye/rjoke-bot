import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { 
  InteractionType,
  InteractionResponseType 
} from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import { VerifyDiscordRequest } from './utils.js';
import { command as linkedinCommand } from './commands/linkedin.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY!) }));

// Create the router
const router = express.Router();

// Map of command handlers
const commands = new Map([
  ['linkedin', linkedinCommand]
]);

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
router.post('/interactions', async function (req: Request, res: Response) {
  // Interaction type and data
  const interaction = req.body as APIInteraction;

  /**
   * Handle verification requests
   */
  if (interaction.type === InteractionType.Ping) {
    return res.status(200).json({
      type: InteractionType.Ping
    });
  }

  // Log request bodies
  console.log(req.body);

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (interaction.type === InteractionType.ApplicationCommand) {
    const { name } = interaction.data;
    const command = commands.get(name);

    if (command) {
      await command.execute(interaction, res);
      return;
    }
  }

  return res.status(400).send('Unknown interaction type');
});

// Mount the router on the app
app.use('/', router);

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
