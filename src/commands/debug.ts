import { ButtonStyle, ComponentType, InteractionType, InteractionResponseType } from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { COLORS, createSuccessEmbed, getUserFromInteraction } from './shared';

export const command: Command = {
    data: {
        name: 'debug',
        type: 1,
        description: 'Comando de prueba que muestra diferentes elementos de Discord',
        options: [],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        try {
            const user = getUserFromInteraction(interaction);

            if (interaction.type === InteractionType.ApplicationCommand) {
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: '🔍 Esto es un mensaje de texto normal',
                        embeds: [
                            {
                                title: '🛠️ Panel de Debug',
                                description: 'Este es un embed de prueba con varios elementos',
                                color: COLORS.PRIMARY,
                                fields: [
                                    {
                                        name: '👤 Usuario',
                                        value: `<@${user.id}>`,
                                        inline: true
                                    },
                                    {
                                        name: '⏰ Timestamp',
                                        value: new Date().toISOString(),
                                        inline: true
                                    },
                                    {
                                        name: '📝 Campo Largo',
                                        value: 'Este es un campo que ocupa toda una línea con más texto',
                                        inline: false
                                    }
                                ],
                                footer: {
                                    text: '🤖 Bot de Prueba'
                                },
                                timestamp: new Date().toISOString()
                            }
                        ],
                        components: [
                            {
                                type: ComponentType.ActionRow,
                                components: [
                                    {
                                        type: ComponentType.Button,
                                        custom_id: `${command.data.name}_ping`,
                                        style: ButtonStyle.Primary,
                                        label: 'Ping',
                                        emoji: {
                                            name: '🏓'
                                        }
                                    },
                                    {
                                        type: ComponentType.Button,
                                        custom_id: `${command.data.name}_info`,
                                        style: ButtonStyle.Secondary,
                                        label: 'Info',
                                        emoji: {
                                            name: 'ℹ️'
                                        }
                                    },
                                    {
                                        type: ComponentType.Button,
                                        style: ButtonStyle.Link,
                                        label: 'GitHub',
                                        url: 'https://github.com/Reddishye/rjoke-bot',
                                        emoji: {
                                            name: '📦'
                                        }
                                    }
                                ]
                            }
                        ],
                        flags: 64 // Ephemeral
                    }
                });
                return;
            }

            if (interaction.type === InteractionType.MessageComponent) {
                const buttonId = interaction.data.custom_id;
                
                switch (buttonId) {
                    case `${command.data.name}_ping`:
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createSuccessEmbed('🏓 Pong!', 'El bot está funcionando correctamente')],
                                flags: 64
                            }
                        });
                        break;
                    
                    case `${command.data.name}_info`:
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [{
                                    title: 'ℹ️ Información',
                                    description: 'Este es un mensaje de información detallada',
                                    color: COLORS.PRIMARY,
                                    fields: [
                                        {
                                            name: 'Versión',
                                            value: process.env.npm_package_version || 'Unknown',
                                            inline: true
                                        },
                                        {
                                            name: 'Autores',
                                            value: JSON.parse(process.env.npm_package_author || '{}').name || 'Unknown',
                                            inline: true
                                        }
                                    ],
                                    timestamp: new Date().toISOString()
                                }],
                                flags: 64
                            }
                        });
                        break;

                    default:
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                content: '❌ Interacción no reconocida',
                                flags: 64
                            }
                        });
                }
                return;
            }
        } catch (error) {
            console.error('Error en el comando debug:', error);
            res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    embeds: [{
                        title: '❌ Error',
                        description: 'Ha ocurrido un error al procesar el comando.',
                        color: COLORS.DANGER
                    }],
                    flags: 64
                }
            });
        }
    }
};
