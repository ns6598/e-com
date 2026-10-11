/**
 * AUREVA Atelier Structured Console Logger
 */

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
}

function timestamp() {
  return new Date().toISOString()
}

export const logger = {
  info: (msg, meta = '') => {
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.cyan}[INFO]${colors.reset} ${msg}`, meta ? meta : '')
  },
  success: (msg, meta = '') => {
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.green}[SUCCESS]${colors.reset} ${msg}`, meta ? meta : '')
  },
  warn: (msg, meta = '') => {
    console.warn(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${msg}`, meta ? meta : '')
  },
  error: (msg, err = '') => {
    console.error(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${msg}`, err ? err : '')
  },
  http: (method, url, status, durationMs) => {
    const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green
    console.log(
      `${colors.dim}[${timestamp()}]${colors.reset} ${colors.magenta}[HTTP]${colors.reset} ${method.padEnd(6)} ${url.padEnd(28)} ${statusColor}${status}${colors.reset} ${colors.dim}(${durationMs}ms)${colors.reset}`
    )
  },
}

export default logger
