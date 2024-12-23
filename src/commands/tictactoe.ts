import { ApplicationCommandOptionType, ButtonStyle, ComponentType, InteractionResponseType, InteractionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { APIInteraction, APIActionRowComponent, APIButtonComponent, APIEmbed, APIApplicationCommandOption } from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { COLORS, createErrorEmbed, createInfoEmbed, createSuccessEmbed, createWarningEmbed, getUserFromInteraction } from './shared';
import { activeGames } from '../store.js';

// Interfaces
interface GameState {
    board: string[];
    currentPlayer: string;
    players: {
        X: string;
        O?: string;
    };
    challengedPlayer?: string;
    lastInteractionId?: string;
    lastUpdateTime: number;
}

// Limpiar juegos inactivos cada 30 minutos
setInterval(() => {
    const now = Date.now();
    for (const [channelId, game] of activeGames.entries()) {
        if (now - game.lastUpdateTime > 30 * 60 * 1000) {
            activeGames.delete(channelId);
        }
    }
}, 5 * 60 * 1000);

function isBoardFull(board: string[]): boolean {
    return board.every((cell: string) => cell !== '');
}

function checkWinner(board: string[]): string | null {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

function createGameEmbed(gameState: GameState, title: string, description?: string): APIEmbed {
    const winner = checkWinner(gameState.board);
    const boardIsFull = isBoardFull(gameState.board);
    const status = winner ? `¡${winner} ha ganado!` :
                  boardIsFull ? '¡Empate!' :
                  `Turno de ${gameState.currentPlayer}`;

    return {
        title: title,
        description: description || status,
        color: winner ? COLORS.SUCCESS :
               boardIsFull ? COLORS.WARNING :
               COLORS.PRIMARY,
        fields: [
            {
                name: 'Jugador X',
                value: `<@${gameState.players.X}>`,
                inline: true
            },
            {
                name: 'Jugador O',
                value: gameState.players.O ? `<@${gameState.players.O}>` : 'Esperando...',
                inline: true
            }
        ],
        footer: {
            text: '🎮 Tres en Raya'
        },
        timestamp: new Date().toISOString()
    };
}

function createBoardComponents(gameState: GameState): APIActionRowComponent<APIButtonComponent>[] {
    const rows: APIActionRowComponent<APIButtonComponent>[] = [];
    const winner = checkWinner(gameState.board);
    const boardIsFull = isBoardFull(gameState.board);
    const gameEnded = winner !== null || boardIsFull;

    // Crear el tablero
    for (let i = 0; i < 3; i++) {
        const row: APIActionRowComponent<APIButtonComponent> = {
            type: ComponentType.ActionRow,
            components: []
        };

        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            const value = gameState.board[index];
            
            row.components.push({
                type: ComponentType.Button,
                custom_id: `${command.data.name}_move_${index}`,
                style: value === 'X' ? ButtonStyle.Danger : 
                       value === 'O' ? ButtonStyle.Success : 
                       ButtonStyle.Secondary,
                label: value || ' ',
                disabled: gameEnded || value !== ''
            });
        }

        rows.push(row);
    }

    // Añadir botón de rendirse si el juego está en curso
    if (!gameEnded && gameState.players.O) {
        rows.push({
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    custom_id: `${command.data.name}_surrender`,
                    style: ButtonStyle.Secondary,
                    label: 'Rendirse',
                    emoji: { name: '🏳️' }
                }
            ]
        });
    }

    return rows;
}

export const command: Command = {
    data: {
        name: 'tresenraya',
        type: ApplicationCommandType.ChatInput,
        description: 'Inicia una partida de tres en raya',
        options: [
            {
                name: 'oponente',
                description: 'El jugador al que quieres desafiar',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        try {
            const user = getUserFromInteraction(interaction);

            if (interaction.type === InteractionType.ApplicationCommand) {
                const options = 'options' in interaction.data ? interaction.data.options as APIApplicationCommandOption[] : [];
                const opponentOption = options.find(opt => opt.name === 'oponente');
                
                if (!opponentOption || !('value' in opponentOption)) {
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            embeds: [createErrorEmbed(
                                '❌ Error',
                                'No se ha especificado un oponente válido.'
                            )],
                            flags: 64
                        }
                    });
                    return;
                }

                const opponentId = opponentOption.value as string;
                
                // Validaciones iniciales
                if (opponentId === user.id) {
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            embeds: [createErrorEmbed(
                                '❌ Error',
                                'No puedes jugar contra ti mismo.'
                            )],
                            flags: 64
                        }
                    });
                    return;
                }

                // Verificar si ya hay un juego activo con este jugador
                for (const game of activeGames.values()) {
                    if ((game.players.X === user.id || game.players.O === user.id) && game.lastUpdateTime > Date.now() - 30 * 60 * 1000) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createErrorEmbed(
                                    '❌ Error',
                                    'Ya tienes una partida en curso. Termínala antes de iniciar otra.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }
                }

                // Iniciar nuevo juego
                const gameState: GameState = {
                    board: Array(9).fill(''),
                    currentPlayer: 'X',
                    players: {
                        X: user.id
                    },
                    challengedPlayer: opponentId,
                    lastUpdateTime: Date.now()
                };

                activeGames.set(user.id, gameState);

                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createGameEmbed(
                            gameState,
                            'Nueva Partida',
                            `<@${opponentId}>, has sido retado a una partida de Tres en Raya por <@${user.id}>.\n¿Aceptas el desafío?`
                        )],
                        components: [
                            {
                                type: ComponentType.ActionRow,
                                components: [
                                    {
                                        type: ComponentType.Button,
                                        custom_id: `${command.data.name}_accept`,
                                        style: ButtonStyle.Success,
                                        label: 'Aceptar',
                                        emoji: { name: '👍' }
                                    },
                                    {
                                        type: ComponentType.Button,
                                        custom_id: `${command.data.name}_reject`,
                                        style: ButtonStyle.Danger,
                                        label: 'Rechazar',
                                        emoji: { name: '👎' }
                                    }
                                ]
                            }
                        ]
                    }
                });
                return;
            }

            if (interaction.type === InteractionType.MessageComponent) {
                if (!interaction.message?.interaction?.user) {
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            embeds: [createErrorEmbed(
                                '❌ Error',
                                'No se pudo encontrar la información del juego.'
                            )],
                            flags: 64
                        }
                    });
                    return;
                }

                const gameId = interaction.message.interaction.user.id;
                if (!gameId || !activeGames.has(gameId)) {
                    res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            embeds: [createErrorEmbed(
                                '❌ Error',
                                'Esta partida ya no está activa.'
                            )],
                            flags: 64
                        }
                    });
                    return;
                }

                const gameState = activeGames.get(gameId)!;
                const buttonId = interaction.data.custom_id;

                // Evitar procesamiento duplicado de interacciones
                if (gameState.lastInteractionId === interaction.id) {
                    res.json({ type: InteractionResponseType.DeferredMessageUpdate });
                    return;
                }
                gameState.lastInteractionId = interaction.id;
                gameState.lastUpdateTime = Date.now();

                // Manejar aceptar/rechazar desafío
                if (buttonId === `${command.data.name}_accept`) {
                    if (user.id !== gameState.challengedPlayer) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createErrorEmbed(
                                    '❌ Error',
                                    'Solo el jugador retado puede aceptar el desafío.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    gameState.players.O = user.id;
                    gameState.challengedPlayer = undefined;

                    res.json({
                        type: InteractionResponseType.UpdateMessage,
                        data: {
                            embeds: [createGameEmbed(
                                gameState,
                                '¡Partida Iniciada!',
                                '¡El desafío ha sido aceptado! Comienza el juego.'
                            )],
                            components: createBoardComponents(gameState)
                        }
                    });
                    return;
                }

                if (buttonId === `${command.data.name}_reject`) {
                    if (user.id !== gameState.challengedPlayer) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createErrorEmbed(
                                    '❌ Error',
                                    'Solo el jugador retado puede rechazar el desafío.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    activeGames.delete(gameId);
                    res.json({
                        type: InteractionResponseType.UpdateMessage,
                        data: {
                            embeds: [createErrorEmbed(
                                '❌ Desafío Rechazado',
                                `<@${user.id}> ha rechazado el desafío.`
                            )],
                            components: []
                        }
                    });
                    return;
                }

                if (buttonId === `${command.data.name}_surrender`) {
                    if (user.id !== gameState.players.X && user.id !== gameState.players.O) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createErrorEmbed(
                                    '❌ Error',
                                    'Solo los jugadores pueden rendirse.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    const winner = user.id === gameState.players.X ? 'O' : 'X';
                    const winnerId = winner === 'X' ? gameState.players.X : gameState.players.O;

                    res.json({
                        type: InteractionResponseType.UpdateMessage,
                        data: {
                            embeds: [createGameEmbed(
                                gameState,
                                '¡Partida Finalizada!',
                                `<@${user.id}> se ha rendido.\n¡<@${winnerId}> es el ganador! 🎉`
                            )],
                            components: createBoardComponents(gameState)
                        }
                    });
                    return;
                }

                // Procesar movimiento
                if (buttonId.startsWith(`${command.data.name}_move_`)) {
                    if (!gameState.players.O) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createWarningEmbed(
                                    '⚠️ Espera',
                                    'El oponente aún no ha aceptado el desafío.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    const playerSymbol = gameState.players.X === user.id ? 'X' : 'O';
                    if (playerSymbol !== gameState.currentPlayer) {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createWarningEmbed(
                                    '⚠️ Espera',
                                    'No es tu turno.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    const position = parseInt(buttonId.split('_')[3]);
                    if (gameState.board[position] !== '') {
                        res.json({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [createWarningEmbed(
                                    '⚠️ Movimiento Inválido',
                                    'Esta casilla ya está ocupada.'
                                )],
                                flags: 64
                            }
                        });
                        return;
                    }

                    gameState.board[position] = playerSymbol;
                    const winner = checkWinner(gameState.board);
                    const boardIsFull = isBoardFull(gameState.board);

                    if (winner || boardIsFull) {
                        const title = winner ? '🎉 ¡Fin de la Partida!' : '🤝 ¡Empate!';
                        const description = winner 
                            ? `¡<@${user.id}> (${winner}) ha ganado la partida!`
                            : '¡La partida ha terminado en empate!';

                        res.json({
                            type: InteractionResponseType.UpdateMessage,
                            data: {
                                embeds: [createGameEmbed(gameState, title, description)],
                                components: createBoardComponents(gameState)
                            }
                        });
                        return;
                    }

                    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
                    const nextPlayer = gameState.currentPlayer === 'X' ? gameState.players.X : gameState.players.O;

                    res.json({
                        type: InteractionResponseType.UpdateMessage,
                        data: {
                            embeds: [createGameEmbed(
                                gameState,
                                'Partida en Curso',
                                `¡Buen movimiento! Es el turno de <@${nextPlayer}>`
                            )],
                            components: createBoardComponents(gameState)
                        }
                    });
                    return;
                }

                // Si llegamos aquí, es una interacción no manejada
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createErrorEmbed(
                            '❌ Error',
                            'Interacción no reconocida.'
                        )],
                        flags: 64
                    }
                });
            }
        } catch (error) {
            console.error('Error en el comando tresenraya:', error);
            res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    embeds: [createErrorEmbed(
                        '❌ Error Interno',
                        'Ha ocurrido un error al procesar el comando.'
                    )],
                    flags: 64
                }
            });
        }
    }
};
