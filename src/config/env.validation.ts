
import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  CORS_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:5173'),

  // JWT Access Token
  JWT_SECRET: Joi.string()
    .min(64)
    .required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .default('15m'),

  // JWT Refresh Token
  JWT_REFRESH_SECRET: Joi.string()
    .min(64)
    .required(),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d'),

  // Database
  DATABASE_URL: Joi.string()
    .required(),

  // File Upload
  UPLOAD_MAX_FILE_SIZE: Joi.number()
    .integer()
    .min(1)
    .default(10485760),

  UPLOAD_DIR: Joi.string()
    .default('uploads'),
});
