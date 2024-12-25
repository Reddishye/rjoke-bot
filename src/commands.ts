import 'dotenv/config';
import { InstallGlobalCommands } from './utils';
import { command as linkedinCommand } from './commands/linkedin';
import { command as debugCommand } from './commands/debug';
import { command as imgtogifCommand, imageCommand as imgtogifImageCommand } from './commands/imgtogif';
import { command as imgtogifwithbubbleCommand, imageCommand as imgtogifwithbubbleImageCommand } from './commands/imgtogifwithbubble';
import { command as imagetogifwithtextCommand } from './commands/imagetogifwithtext';
import { command as langCommand } from './commands/lang';
import type { Command } from './commands/types';
import type { APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';

export const commands: Command[] = [
    linkedinCommand,
    debugCommand,
    imgtogifCommand,
    imgtogifImageCommand,
    imgtogifwithbubbleCommand,
    imgtogifwithbubbleImageCommand,
    imagetogifwithtextCommand,
    langCommand
];

export function getCommandsData() {
    console.log('Getting commands data');
    const data = commands.map(command => command.data);
    console.log('Commands to register:', JSON.stringify(data, null, 2));
    return data;
}

export function executeCommand(commandName: string, interaction: APIInteraction, res: Response) {
    console.log(`Executing command: ${commandName}`);
    const command = commands.find(cmd => cmd.data.name === commandName);
    if (!command) {
        console.error(`Command ${commandName} not found`);
        throw new Error(`Command ${commandName} not found`);
    }
    return command.execute(interaction, res);
}

// Register commands with Discord
export async function registerCommands() {
    if (!process.env.APP_ID) {
        throw new Error('Missing APP_ID in environment variables');
    }
    
    console.log('Starting command registration...');
    console.log('APP_ID:', process.env.APP_ID);
    
    try {
        const commandsData = getCommandsData();
        console.log('Registering commands with Discord...');
        await InstallGlobalCommands(process.env.APP_ID, commandsData);
        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
        throw error;
    }
}

// Run registration
console.log('Running command registration...');
registerCommands().catch(err => {
    console.error('Failed to register commands:', err);
    process.exit(1);
});
