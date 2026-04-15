import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getRequiredEnv(name: string, fallback?: string): string {
  const fromEnv = getOptionalEnv(name);
  if (fromEnv) {
    return fromEnv;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/observability.sqlite');

export const env = {
  baseRpcUrl: getRequiredEnv('BASE_RPC_URL', 'https://mainnet.base.org'),
  dbPath: path.resolve(getRequiredEnv('OBSERVABILITY_DB_PATH', DEFAULT_DB_PATH)),
  baseStartBlock: (() => {
    const raw = getOptionalEnv('BASE_START_BLOCK');
    return raw ? Number.parseInt(raw, 10) : undefined;
  })(),
  telegramChatId: getOptionalEnv('TELEGRAM_CHAT_ID'),
  telegramBotToken: getOptionalEnv('TELEGRAM_BOT_TOKEN'),
} as const;

if (env.baseStartBlock !== undefined && Number.isNaN(env.baseStartBlock)) {
  throw new Error('BASE_START_BLOCK must be a valid integer when provided');
}
