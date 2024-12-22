import 'dotenv/config';
import nacl from 'tweetnacl';
import type { Request, Response } from 'express';

export function VerifyDiscordRequest(clientKey: string) {
  return function (req: Request, res: Response, buf: Buffer) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const body = buf.toString();

    if (!signature || !timestamp || !clientKey) {
      console.error('Missing signature, timestamp, or client key');
      console.log('Signature:', signature);
      console.log('Timestamp:', timestamp);
      console.log('ClientKey:', clientKey);
      return res.status(401).send('Invalid request signature');
    }

    try {
      const isVerified = nacl.sign.detached.verify(
        new Uint8Array(Buffer.from(timestamp + body)),
        new Uint8Array(Buffer.from(signature, 'hex')),
        new Uint8Array(Buffer.from(clientKey, 'hex'))
      );

      if (!isVerified) {
        console.error('Invalid signature verification');
        return res.status(401).send('Invalid request signature');
      }
    } catch (err) {
      console.error('Error verifying request:', err);
      return res.status(401).send('Error verifying request');
    }
  };
}

interface DiscordRequestOptions extends RequestInit {
  body?: any;
}

export async function DiscordRequest(endpoint: string, options: DiscordRequestOptions) {
  const url = 'https://discord.com/api/v10/' + endpoint;
  
  if (options.body) options.body = JSON.stringify(options.body);
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'RJokeBot (https://github.com/reddishye/rjokebot, 1.0.0)',
    },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    return Promise.reject(new Error(JSON.stringify(data)));
  }

  return res;
}

export async function InstallGlobalCommands(appId: string, commands: any[]) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}