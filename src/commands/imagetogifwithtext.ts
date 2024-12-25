import { ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { 
    APIInteraction, 
    APIMessageApplicationCommandInteraction,
    APIAttachment,
    APIMessageApplicationCommandInteractionDataResolved,
    APIModalSubmitInteraction
} from 'discord-api-types/v10';
import type { Response } from 'express';
import type { Command } from './types';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from './shared';
import { t } from '../i18n';
import { 
    downloadImage, 
    addTextToGif, 
    MAX_FILE_SIZE, 
    SUPPORTED_FORMATS 
} from '../utils/imageProcessing';

let tempAttachment: APIAttachment | null = null;

export const messageCommand: Command = {
    data: {
        name: 'Image To Gif With Text',
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
                throw new Error('invalidInteraction');
            }

            const messageInteraction = interaction as APIMessageApplicationCommandInteraction;
            const resolved = messageInteraction.data.resolved as APIMessageApplicationCommandInteractionDataResolved;
            const messageId = messageInteraction.data.target_id;
            const message = resolved.messages?.[messageId];

            if (!message || !message.attachments || message.attachments.length === 0) {
                throw new Error('noImage');
            }

            const attachment = message.attachments[0] as APIAttachment;
            tempAttachment = attachment;

            if (attachment.size > MAX_FILE_SIZE) {
                throw new Error('imageTooLarge');
            }

            res.json({
                type: InteractionResponseType.Modal,
                data: {
                    custom_id: 'imagetogifwithtext_modal',
                    title: t(locale, 'imagetogifwithtext.modalTitle', {}, userId),
                    components: [{
                        type: 1,
                        components: [{
                            type: 4,
                            custom_id: 'text_input',
                            label: t(locale, 'imagetogifwithtext.textInputLabel', {}, userId),
                            style: 1,
                            min_length: 1,
                            max_length: 100,
                            required: true
                        }]
                    }]
                }
            });

        } catch (error) {
            handleError(error, interaction, locale, userId);
        }
    },
    handleModal: async (interaction: APIModalSubmitInteraction, res: Response): Promise<void> => {
        const locale = interaction.user?.locale || 'en';
        const userId = interaction.user?.id;

        try {
            const text = interaction.data.components[0].components[0].value;
            
            if (!tempAttachment) {
                throw new Error('noImage');
            }

            await res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: "-# ⌛",
                }
            });

            const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;

            await fetch(webhookUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [createInfoEmbed(
                        t(locale, 'common.processing', {}, userId),
                        t(locale, 'imagetogifwithtext.processing', {}, userId)
                    )]
                })
            });

            console.log('Downloading image:', tempAttachment.url);
            const imageBuffer = await downloadImage(tempAttachment.url);
            
            console.log('Converting to GIF with text...');
            const gifBuffer = await addTextToGif(imageBuffer, text);

            const formData = new FormData();
            formData.append('file', new Blob([gifBuffer], { type: 'image/gif' }), 'converted.gif');
            formData.append('payload_json', JSON.stringify({
                embeds: [createSuccessEmbed(
                    t(locale, 'common.ready', {}, userId),
                    t(locale, 'imagetogifwithtext.success', {}, userId)
                )]
            }));

            const response = await fetch(webhookUrl, {
                method: 'PATCH',
                body: formData
            });

            if (!response.ok) {
                throw new Error('errorSending');
            }

            tempAttachment = null;

        } catch (error) {
            handleError(error, interaction, locale, userId);
        }
    }
};

async function handleError(error: unknown, interaction: APIInteraction, locale: string, userId?: string): Promise<void> {
    console.error('Error in imagetogifwithtext command:', error);
    const webhookUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
    await fetch(webhookUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            embeds: [createErrorEmbed(
                t(locale, 'common.error', {}, userId),
                t(locale, `imagetogifwithtext.${error instanceof Error ? error.message : 'unknownError'}`, {}, userId)
            )],
            flags: 64
        })
    });
}

export const command = messageCommand;
