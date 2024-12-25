import { ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { t } from '../i18n';

export const command: Command = {
    data: {
        name: 'linkedin',
        type: ApplicationCommandType.ChatInput,
        description: 'Shows a funny message about LinkedIn',
        options: [],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        const locale = interaction.user?.locale || 'en';

        res.json({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [{
                    title: t(locale, 'linkedin.title'),
                    description: t(locale, 'linkedin.message'),
                    color: 0x0077B5,
                    footer: {
                        text: t(locale, 'linkedin.footer')
                    }
                }],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: t(locale, 'linkedin.buttonLabel'),
                                style: 5,
                                url: "https://www.linkedin.com/"
                            }
                        ]
                    }
                ]
            }
        });
    }
};
