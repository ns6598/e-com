import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load server-specific .env first, then root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'aureva_dev_fallback_jwt_secret_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'aureva_dev_fallback_cookie_secret',
}

export default config
