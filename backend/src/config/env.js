const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

// Harmonize aliases: MONGO_URI <-> MONGODB_URI, CLIENT_URL <-> FRONTEND_URL
const rawMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const rawClientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
const rawNodeEnv = process.env.NODE_ENV || 'development';

// Strict check for production requirements
if (rawNodeEnv === 'production') {
  const missing = [];
  if (!rawMongoUri) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!rawClientUrl) missing.push('CLIENT_URL');

  if (missing.length > 0) {
    console.error(`\n======================================================`);
    console.error(`FATAL: Missing required production environment variables:`);
    missing.forEach((v) => console.error(`  - ${v}`));
    console.error(`Server cannot start safely without these configured.`);
    console.error(`======================================================\n`);
    process.exit(1);
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default(rawMongoUri || 'mongodb://localhost:27017/flawtrack'),
  MONGODB_URI: z.string().default(rawMongoUri || 'mongodb://localhost:27017/flawtrack'),
  USE_MEMORY_DB: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_key_at_least_32_characters_long_for_dev'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_refresh_jwt_key_at_least_32_characters_long_for_dev'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default(rawClientUrl || 'http://localhost:5173'),
  FRONTEND_URL: z.string().default(rawClientUrl || 'http://localhost:5173'),
  THREAT_INTEL_MODE: z.enum(['live', 'offline']).default('offline'),
  SMTP_HOST: z.string().optional().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('flawtrack-alerts@example.com'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse({
  ...process.env,
  MONGO_URI: rawMongoUri || process.env.MONGO_URI,
  MONGODB_URI: rawMongoUri || process.env.MONGODB_URI,
  CLIENT_URL: rawClientUrl || process.env.CLIENT_URL,
  FRONTEND_URL: rawClientUrl || process.env.FRONTEND_URL,
});

if (!parsedEnv.success) {
  console.error('\n======================================================');
  console.error('Invalid environment variables:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  console.error('======================================================\n');
  process.exit(1);
}

module.exports = parsedEnv.data;
