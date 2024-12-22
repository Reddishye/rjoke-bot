import type { RESTPostAPIApplicationCommandsJSONBody, APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';

export interface Command {
    data: RESTPostAPIApplicationCommandsJSONBody;
    execute: (interaction: APIInteraction, res: Response) => Promise<void>;
}
