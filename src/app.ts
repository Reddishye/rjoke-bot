import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { 
  InteractionType,
  InteractionResponseType 
} from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import { command as linkedinCommand } from './commands/linkedin';
import { command as debugCommand } from './commands/debug';
import { command as imgtogifCommand, imageCommand as imgtogifImageCommand } from './commands/imgtogif';
import { command as imgtogifwithbubbleCommand, imageCommand as imgtogifwithbubbleImageCommand } from './commands/imgtogifwithbubble';
import { command as imagetogifwithtextCommand } from './commands/imagetogifwithtext';
import { command as langCommand } from './commands/lang';
import { getUserLanguage } from './utils/storage';

const commands = [
    linkedinCommand,
    debugCommand,
    imgtogifCommand,
    imgtogifImageCommand,
    imgtogifwithbubbleCommand,
    imgtogifwithbubbleImageCommand,
    imagetogifwithtextCommand,
    langCommand
];

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Verify that requests are coming from Discord
app.use(express.json());
app.use(verifyKeyMiddleware(process.env.PUBLIC_KEY!));

// Create the router
const router = express.Router();

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
  console.log('Received interaction:', JSON.stringify(interaction, null, 2));

  // Set user's language before processing any command
  if (interaction.user) {
    const userId = interaction.user.id;
    const preferredLang = getUserLanguage(userId);
    if (preferredLang) {
      console.log(`Setting user ${userId} language to ${preferredLang}`);
      interaction.user.locale = preferredLang;
    } else {
      console.log(`No preferred language for user ${userId}, using Discord locale: ${interaction.user.locale}`);
    }
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (interaction.type === InteractionType.ApplicationCommand) {
    const { name } = interaction.data;
    const command = commands.find(cmd => 
      cmd.data.name.toLowerCase() === name.toLowerCase()
    );

    if (command) {
      try {
        await command.execute(interaction, res);
      } catch (error) {
        console.error(`Error executing command ${name}:`, error);
        res.status(500).json({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'An error occurred while processing your command.',
            flags: 64
          }
        });
      }
      return;
    }
  }

  /**
   * handle button interactions
   */
  if (interaction.type === InteractionType.MessageComponent) {
    const commandName = interaction.data.custom_id.split('_')[0];
    const command = commands.find(cmd => 
      cmd.data.name.toLowerCase() === commandName.toLowerCase()
    );

    if (command) {
      try {
        await command.execute(interaction, res);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        res.status(500).json({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'An error occurred while processing your command.',
            flags: 64
          }
        });
      }
      return;
    }
  }

  /**
   * handle modal interactions
   */
  if (interaction.type === InteractionType.ModalSubmit) {
    const modalId = interaction.data.custom_id.split('_')[0];
    const command = commands.find(cmd => 
        cmd.data.name.toLowerCase().replace(/\s+/g, '') === modalId.toLowerCase()
    );

    if (command?.handleModal) {
        try {
            await command.handleModal(interaction, res);
        } catch (error) {
            console.error(`Error handling modal ${modalId}:`, error);
            res.status(500).json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: 'An error occurred while processing your command.',
                    flags: 64
                }
            });
        }
        return;
    }
  }

  return res.status(400).send('Unknown interaction type');
});

// Add the router to the app
app.use('/', router);

// Start the server
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
