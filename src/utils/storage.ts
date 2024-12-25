import fs from 'fs';
import path from 'path';

const USER_LANGUAGES_FILE = path.join(__dirname, '../../data/userLanguages.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(USER_LANGUAGES_FILE))) {
    fs.mkdirSync(path.dirname(USER_LANGUAGES_FILE), { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(USER_LANGUAGES_FILE)) {
    fs.writeFileSync(USER_LANGUAGES_FILE, '{}', 'utf8');
}

export interface UserLanguages {
    [userId: string]: string;
}

export function getUserLanguage(userId: string): string | undefined {
    try {
        const data = fs.readFileSync(USER_LANGUAGES_FILE, 'utf8');
        const languages: UserLanguages = JSON.parse(data);
        return languages[userId];
    } catch (error) {
        console.error('Error reading user languages:', error);
        return undefined;
    }
}

export function setUserLanguage(userId: string, language: string): void {
    try {
        const data = fs.readFileSync(USER_LANGUAGES_FILE, 'utf8');
        const languages: UserLanguages = JSON.parse(data);
        languages[userId] = language;
        fs.writeFileSync(USER_LANGUAGES_FILE, JSON.stringify(languages, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving user language:', error);
    }
}
