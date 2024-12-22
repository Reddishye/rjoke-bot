import type { APIInteraction } from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-api-types/v10';
import type { Command } from './types.js';
import type { Response } from 'express';

export const command: Command = {
    data: {
        name: 'linkedin',
        type: 1,
        description: 'Muestra un mensaje gracioso sobre LinkedIn',
        options: [],
        integration_types: [0, 1],
        contexts: [0, 1, 2],
    },
    execute: async (interaction: APIInteraction, res: Response) => {
        res.send({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [{
                    title: "👷 ¿Te aburres, desgraciado?",
                    description: "¡Ah, veo que estás aquí en Discord en horario laboral! ¿No tienes vida social? ¿O es que tu único amigo es tu gato?\n\n" +
                                " Ya que estás aquí perdiendo el tiempo, ¿por qué no buscas trabajo en LinkedIn?\n\n" +
                                "Porque seamos sinceros:\n" +
                                "- Tu madre está harta de verte en el sofá\n" +
                                "- Tu cuenta bancaria llora en silencio\n" +
                                "- Hasta tu almohada te juzga por dormir tanto\n\n" +
                                "**¡MUEVE TU TRASERO A LINKEDIN Y HAZ ALGO PRODUCTIVO!**\n" +
                                "_(Este mensaje ha sido patrocinado por tu conciencia)_",
                    color: 0x0077B5,
                    footer: {
                        text: "Deja Discord y ponte a buscar trabajo, vago "
                    }
                }],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Ir a LinkedIn",
                                style: 5,
                                url: "https://www.linkedin.com/"
                            }
                        ]
                    }
                ]

            },
        });
    }
};
