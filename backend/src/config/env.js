const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/vulntrack'),
  USE_MEMORY_DB: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_key_at_least_32_characters_long_for_dev'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_refresh_jwt_key_at_least_32_characters_long_for_dev'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  THREAT_INTEL_MODE: z.enum(['live', 'offline']).default('offline'),
  SMTP_HOST: z.string().optional().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('vulntrack-alerts@example.com'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

module.exports = parsedEnv.data;
