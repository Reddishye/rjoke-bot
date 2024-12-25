import { ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { 
    APIInteraction, 
    APIMessageApplicationCommandInteraction,
    APIAttachment,
    APIMessageApplicationCommandInteractionDataResolved,
    APIContextMenuInteraction
} from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from './shared';
import { t } from '../i18n';
import { 
    downloadImage, 
    addBubbleToGif, 
    MAX_FILE_SIZE, 
    SUPPORTED_FORMATS 
} from '../utils/imageProcessing';

export const messageCommand: Command = {
    data: {
        name: 'Image To Gif With Bubble',
        type: ApplicationCommandType.Message,
        dm_permission: false,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        const locale = interaction.user?.locale || 'en';
        const userId = interaction.user?.id;

        try {
            if (interaction.type !== InteractionType.ApplicationCommand) {
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createErrorEmbed(
                            t(locale, 'common.error', {}, userId),
                            t(locale, 'imgtogifwithbubble.invalidInteraction', {}, userId)
                        )],
                        flags: 64
                    }
                });
                return;
            }

            const messageInteraction = interaction as APIMessageApplicationCommandInteraction;
            const resolved = messageInteraction.data.resolved as APIMessageApplicationCommandInteractionDataResolved;
            const message = resolved.messages?.[Object.keys(resolved.messages)[0]];

            if (!message || !message.attachments || message.attachments.length === 0) {
                res.json({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [createErrorEmbed(
                            t(locale, 'common.error', {}, userId),
                            t(locale, 'imgtogifwithbubble.noImage', {}, userId)
                        )],
                        flags: 64
                    }
                });
                return;
            }

            await processImage(message.attachments[0] as APIAttachment, interaction, res, locale, userId);

        } catch (error) {
            handleError(error, interaction, locale, userId);
        }
    }
};

export const imageCommand: Command = {
    data: {
        name: 'Convert to GIF with Bubble',
        type: ApplicationCommandType.User,
        dm_permission: false,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    execute: async (interaction: APIInteraction, res: Response): Promise<void> => {
        const locale = interaction.user?.locale || 'en';
        const userId = interaction.user?.id;

        try {
            if (interaction.type !== InteractionType.ApplicationCommand) {
                throw new Error('invalidInteraction');
            }

            const contextMenuInteraction = interaction as APIContextMenuInteraction;
            const resolved = contextMenuInteraction.data.resolved as APIMessageApplicationCommandInteractionDataResolved;
            const message = resolved.messages?.[Object.keys(resolved.messages)[0]];

            if (!message || !message.attachments || message.attachments.length === 0) {
                throw new Error('noImage');
            }

            await processImage(message.attachments[0] as APIAttachment, interaction, res, locale, userId);

        } catch (error) {
            handleError(error, interaction, locale, userId);
        }
    }
};

async function processImage(
    attachment: APIAttachment,
    interaction: APIInteraction,
    res: Response,
    locale: string,
    userId?: string
): Promise<void> {
    // First respond that we're processing
    await res.json({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
            embeds: [createInfoEmbed(
                t(locale, 'common.processing', {}, userId),
                t(locale, 'imgtogifwithbubble.processing', {}, userId)
            )]
        }
    });

    if (!attachment) {
        throw new Error('noImageProvided');
    }

    if (attachment.size > MAX_FILE_SIZE) {
        throw new Error('imageTooLarge');
    }

    // Download and process the image
    const imageBuffer = await downloadImage(attachment.url);
    const gifBuffer = await addBubbleToGif(imageBuffer);

    // Send the GIF as response
    const formData = new FormData();
    formData.append('file', new Blob([gifBuffer], { type: 'image/gif' }), 'converted_with_bubble.gif');
    formData.append('payload_json', JSON.stringify({
        embeds: [createSuccessEmbed(
            t(locale, 'common.ready', {}, userId),
            t(locale, 'imgtogifwithbubble.success', {}, userId)
        )]
    }));

    // Send the GIF to Discord
    const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
    const response = await fetch(webhookUrl, {
        method: 'PATCH',
        body: formData
    });

    if (!response.ok) {
        throw new Error('errorSending');
    }
}

async function handleError(error: unknown, interaction: APIInteraction, locale: string, userId?: string): Promise<void> {
    console.error('Error in imgtogifwithbubble command:', error);
    const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
    await fetch(webhookUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            embeds: [createErrorEmbed(
                t(locale, 'common.error', {}, userId),
                t(locale, `imgtogifwithbubble.${error instanceof Error ? error.message : 'unknownError'}`, {}, userId)
            )],
            flags: 64
        })
    });
}

// Export commands
export const command = messageCommand;
