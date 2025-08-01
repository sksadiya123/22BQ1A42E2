import axios from 'axios';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogStack = 'frontend' | 'backend';

export interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: string;
  message: string;
}

const LOGGING_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';

/**
 * Sends log data to AffordMed evaluation service
 * @param stack - 'frontend' or 'backend'
 * @param level - Log level: 'debug', 'info', 'warn', 'error', 'fatal'
 * @param packageName - Package identifier per AffordMed spec
 * @param message - Log message
 */
export async function log(
  stack: LogStack,
  level: LogLevel,
  packageName: string,
  message: string
): Promise<void> {
  try {
    const payload: LogPayload = {
      stack,
      level,
      package: packageName,
      message
    };

    await axios.post(LOGGING_ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
  } catch (error) {
    // Fallback to console if logging service is unavailable
    console.error('Failed to send log to AffordMed service:', error);
    console.log(`[${stack}] [${level}] [${packageName}] ${message}`);
  }
}

export default log;
