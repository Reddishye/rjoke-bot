import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import type { Response } from 'express';

export interface Command {
    data: RESTPostAPIApplicationCommandsJSONBody;
    execute: (interaction: APIInteraction, res: Response) => Promise<void>;
    handleModal?: (interaction: APIInteraction, res: Response) => Promise<void>;
}
