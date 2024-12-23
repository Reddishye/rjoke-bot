import type { APIEmbed, APIUser, APIInteraction } from 'discord-api-types/v10';

export const COLORS = {
    PRIMARY: 0x5865F2,    // Discord Blurple
    SUCCESS: 0x57F287,    // Verde
    DANGER: 0xED4245,     // Rojo
    WARNING: 0xFEE75C,    // Amarillo
    SECONDARY: 0x4F545C   // Gris
};

export function getUserFromInteraction(interaction: APIInteraction): APIUser {
    if ('user' in interaction && interaction.user) {
        return interaction.user;
    }
    if ('member' in interaction && interaction.member?.user) {
        return interaction.member.user;
    }
    throw new Error('No user found in interaction');
}

export function createErrorEmbed(title: string, description: string, color: number = COLORS.DANGER): APIEmbed {
    return {
        title,
        description,
        color,
        timestamp: new Date().toISOString()
    };
}

export function createSuccessEmbed(title: string, description: string): APIEmbed {
    return createErrorEmbed(title, description, COLORS.SUCCESS);
}

export function createInfoEmbed(title: string, description: string): APIEmbed {
    return createErrorEmbed(title, description, COLORS.PRIMARY);
}

export function createWarningEmbed(title: string, description: string): APIEmbed {
    return createErrorEmbed(title, description, COLORS.WARNING);
}
