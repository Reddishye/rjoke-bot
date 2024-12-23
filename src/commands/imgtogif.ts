import { ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { APIInteraction, APIMessageApplicationCommandInteraction, APIAttachment } from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from './shared';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB (Discord's limit)

async function downloadImage(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

async function convertToGif(imageBuffer: Uint8Array): Promise<Buffer> {
    try {
        // Detectar el tipo de archivo
        const fileType = await fileTypeFromBuffer(imageBuffer);
        if (!fileType || !SUPPORTED_FORMATS.includes(fileType.mime)) {
            throw new Error('Formato de imagen no soportado');
        }

        // Convertir a GIF usando sharp
        const gifBuffer = await sharp(imageBuffer, { animated: true })
            .gif()
            .toBuffer();

        return gifBuffer;
    } catch (error) {
        console.error('Error converting to GIF:', error);
        throw new Error('Error al convertir la imagen a GIF');
    }
}

export const command: Command = {
    data: {
        name: 'Image To Gif',
        type: ApplicationCommandType.Message,
        dm_permission: false,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        try {
            if (interaction.type !== InteractionType.ApplicationCommand) {
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createErrorEmbed(
                            '❌ Error',
                            'Tipo de interacción no válida'
                        )],
                        flags: 64
                    }
                });
                return;
            }

            const messageInteraction = interaction as APIMessageApplicationCommandInteraction;
            const message = messageInteraction.data.resolved?.messages?.[Object.keys(messageInteraction.data.resolved.messages)[0]];

            if (!message || !message.attachments || message.attachments.length === 0) {
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createErrorEmbed(
                            '❌ Error',
                            'No se encontró ninguna imagen en el mensaje'
                        )],
                        flags: 64
                    }
                });
                return;
            }

            // Primero respondemos que estamos procesando
            await res.json({
                type: InteractionResponseType.DeferredChannelMessageWithSource,
                data: {
                    embeds: [createInfoEmbed(
                        '🔄 Procesando',
                        'Convirtiendo tu imagen a GIF...'
                    )]
                }
            });

            // Obtener la primera imagen adjunta
            const attachment = message.attachments[0] as APIAttachment;
            
            if (!attachment) {
                throw new Error('No se proporcionó ninguna imagen');
            }

            if (attachment.size > MAX_FILE_SIZE) {
                throw new Error('La imagen es demasiado grande. El límite es 8MB');
            }

            // Descargar la imagen
            console.log('Descargando imagen:', attachment.url);
            const imageBuffer = await downloadImage(attachment.url);
            
            // Convertir a GIF
            console.log('Convirtiendo a GIF...');
            const gifBuffer = await convertToGif(imageBuffer);

            // Enviar el GIF como respuesta
            const formData = new FormData();
            formData.append('file', new Blob([gifBuffer], { type: 'image/gif' }), 'converted.gif');
            formData.append('payload_json', JSON.stringify({
                embeds: [createSuccessEmbed(
                    '✅ ¡Listo!',
                    'Aquí tienes tu GIF'
                )]
            }));

            // Enviar el GIF a Discord
            const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
            const response = await fetch(webhookUrl, {
                method: 'PATCH',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al enviar el GIF a Discord');
            }

        } catch (error) {
            console.error('Error in imgtogif command:', error);
            const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
            await fetch(webhookUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [createErrorEmbed(
                        '❌ Error',
                        error instanceof Error ? error.message : 'Error desconocido al procesar la imagen'
                    )],
                    flags: 64
                })
            });
        }
    }
};
