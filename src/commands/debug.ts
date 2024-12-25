import { ApplicationCommandType, ButtonStyle, ComponentType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { t } from '../i18n';

export const command: Command = {
    data: {
        name: 'debug',
        type: ApplicationCommandType.ChatInput,
        description: 'Debug commands for testing',
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        const locale = interaction.user?.locale || 'en';

        if (interaction.type === InteractionType.ApplicationCommand) {
            res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: t(locale, 'debug.normalMessage'),
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    custom_id: 'debug_ping',
                                    label: t(locale, 'debug.ping'),
                                    style: ButtonStyle.Primary
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: 'debug_ephemeral',
                                    label: t(locale, 'debug.ephemeral'),
                                    style: ButtonStyle.Secondary
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: 'debug_button',
                                    label: t(locale, 'debug.button'),
                                    style: ButtonStyle.Success
                                }
                            ]
                        }
                    ]
                }
            });
            return;
        }

        if (interaction.type === InteractionType.MessageComponent) {
            const buttonId = interaction.data.custom_id;
            
            switch (buttonId) {
                case 'debug_ping':
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: t(locale, 'debug.pong')
                        }
                    });
                    break;
                
                case 'debug_ephemeral':
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: t(locale, 'debug.ephemeralMessage'),
                            flags: 64
                        }
                    });
                    break;
                
                case 'debug_button':
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: t(locale, 'debug.buttonMessage'),
                            components: [
                                {
                                    type: ComponentType.ActionRow,
                                    components: [
                                        {
                                            type: ComponentType.Button,
                                            custom_id: 'debug_clicked',
                                            label: t(locale, 'debug.button'),
                                            style: ButtonStyle.Success
                                        }
                                    ]
                                }
                            ]
                        }
                    });
                    break;

                case 'debug_clicked':
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: t(locale, 'debug.buttonClicked')
                        }
                    });
                    break;
            }
            return;
        }
    }
};
