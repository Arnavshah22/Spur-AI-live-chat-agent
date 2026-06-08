import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().optional(),
  MAX_MESSAGE_LENGTH: z.coerce.number().int().positive().default(2000),
  MAX_HISTORY_MESSAGES: z.coerce.number().int().positive().default(10),
  MAX_TOKENS: z.coerce.number().int().positive().default(500),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional(),
  REDIS_CACHE_TTL: z.coerce.number().int().positive().default(86400), // 24 hours
  // Push Notification VAPID keys
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env: EnvConfig = validateEnv();
