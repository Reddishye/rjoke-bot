import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import fs from 'fs';

export const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB (Discord's limit)
export const DEFAULT_BUBBLE_HEIGHT_RATIO = 0.4; // 20% of image height
export const TEXT_HEIGHT = 60; // Height for text area
export const TEXT_PADDING = 10; // Padding around text
export const BUBBLE_IMAGE_PATH = path.join(__dirname, '../../resources/bubble.png');

export async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function convertToGif(imageBuffer: Buffer): Promise<Buffer> {
    try {
        // Detect file type using Uint8Array
        const fileType = await fileTypeFromBuffer(imageBuffer);
        if (!fileType || !SUPPORTED_FORMATS.includes(fileType.mime)) {
            throw new Error('unsupportedFormat');
        }

        // Convert to GIF using sharp
        const gifBuffer = await sharp(imageBuffer, { animated: true })
            .gif({ colours: 256, effort: 10 })
            .toBuffer();

        return gifBuffer;
    } catch (error) {
        console.error('Error converting to GIF:', error);
        throw new Error('conversionError');
    }
}

export async function addTextToGif(imageBuffer: Buffer, text: string): Promise<Buffer> {
    try {
        // Detect file type using Uint8Array
        const fileType = await fileTypeFromBuffer(imageBuffer);
        if (!fileType || !SUPPORTED_FORMATS.includes(fileType.mime)) {
            throw new Error('unsupportedFormat');
        }

        // Load the original image and get its metadata
        const metadata = await sharp(imageBuffer).metadata();
        const originalWidth = metadata.width || 500;
        const originalHeight = metadata.height || 500;

        // Calculate text area height (40% of original image height)
        const textAreaHeight = Math.round(originalHeight * 0.4);

        // Create SVG text with specific font size
        const fontSize = Math.min(textAreaHeight * 0.8, originalWidth / (text.length * 0.7));
        const svgText = `
            <svg width="${originalWidth}" height="${textAreaHeight}">
                <style>
                    .text {
                        fill: black;
                        font-family: Arial, sans-serif;
                        font-size: ${fontSize}px;
                        font-weight: bold;
                    }
                </style>
                <text
                    x="50%"
                    y="50%"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text"
                >${text}</text>
            </svg>`;

        // Create a new image with space for text at the top
        const finalImage = await sharp({
            create: {
                width: originalWidth,
                height: originalHeight + textAreaHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .composite([
            // White background for text
            {
                input: {
                    create: {
                        width: originalWidth,
                        height: textAreaHeight,
                        channels: 4,
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    }
                },
                top: 0,
                left: 0
            },
            // Text as SVG
            {
                input: Buffer.from(svgText),
                top: 0,
                left: 0
            },
            // Original image
            { 
                input: imageBuffer,
                top: textAreaHeight,
                left: 0
            }
        ])
        .gif({ colours: 256, effort: 10 })
        .toBuffer();

        return finalImage;
    } catch (error) {
        console.error('Error converting to GIF with text:', error);
        throw new Error('conversionError');
    }
}

export async function addBubbleToGif(imageBuffer: Buffer): Promise<Buffer> {
    try {
        // Detect file type using Uint8Array
        const fileType = await fileTypeFromBuffer(imageBuffer);
        if (!fileType || !SUPPORTED_FORMATS.includes(fileType.mime)) {
            throw new Error('unsupportedFormat');
        }

        // Check if bubble image exists
        if (!fs.existsSync(BUBBLE_IMAGE_PATH)) {
            throw new Error('bubbleImageNotFound');
        }

        // Load the original image and get its metadata
        const metadata = await sharp(imageBuffer).metadata();
        const originalWidth = metadata.width || 500;
        const originalHeight = metadata.height || 500;

        // Calculate bubble height as 20% of the original image height
        const bubbleHeight = Math.floor(originalHeight * DEFAULT_BUBBLE_HEIGHT_RATIO);

        // Load and resize the bubble image to match the width
        const resizedBubble = await sharp(BUBBLE_IMAGE_PATH)
            .resize(originalWidth, bubbleHeight, {
                fit: 'fill'
            })
            .toBuffer();

        // Create final image with bubble overlaid
        const finalImage = await sharp(imageBuffer)
            .composite([
                {
                    input: resizedBubble,
                    top: 0,
                    left: 0,
                    blend: 'over'
                }
            ])
            .gif({ colours: 256, effort: 10 })
            .toBuffer();

        return finalImage;
    } catch (error) {
        console.error('Error converting to GIF with bubble:', error);
        throw new Error('conversionError');
    }
}
