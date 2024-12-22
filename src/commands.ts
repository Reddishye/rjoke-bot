import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import { getCommandsData } from './commands/index.js';

async function main() {
    const commands = await getCommandsData();
    await InstallGlobalCommands(process.env.APP_ID!, commands);
}

main().catch(console.error);
