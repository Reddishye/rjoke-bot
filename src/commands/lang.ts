import { ApplicationCommandType, InteractionResponseType, InteractionType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { 
    APIInteraction, 
    APIChatInputApplicationCommandInteraction,
    APIApplicationCommandInteractionDataStringOption
} from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { t } from '../i18n';
import { createSuccessEmbed } from './shared';
import { setUserLanguage } from '../utils/storage';

export const command: Command = {
    data: {
        name: 'lang',
        type: ApplicationCommandType.ChatInput,
        description: 'Set your preferred language',
        options: [
            {
                name: 'language',
                description: 'Choose your language',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: 'English',
                        value: 'en'
                    },
                    {
                        name: 'Español',
                        value: 'es'
                    }
                ]
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        if (interaction.type !== InteractionType.ApplicationCommand) {
            return;
        }

        // Type check to ensure this is a chat input command
        if (interaction.data.type !== ApplicationCommandType.ChatInput) {
            return;
        }

        const chatInteraction = interaction as APIChatInputApplicationCommandInteraction;
        const userId = chatInteraction.user?.id;
        const option = chatInteraction.data.options?.[0] as APIApplicationCommandInteractionDataStringOption;
        const selectedLang = option?.value;

        if (userId && selectedLang) {
            setUserLanguage(userId, selectedLang);

            res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    embeds: [createSuccessEmbed(
                        t(selectedLang, 'lang.success', {}, userId),
                        t(selectedLang, 'lang.changed', { language: t(selectedLang, `lang.${selectedLang}`, {}, userId) }, userId)
                    )],
                    flags: 64 // Ephemeral message
                }
            });
        }
    }
};
