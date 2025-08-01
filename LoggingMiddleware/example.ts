import { log } from './logger';

// Example usage of the logging middleware
async function demonstrateLogging() {
  // Log application startup
  await log('frontend', 'info', 'app-initialization', 'Application starting up');
  
  // Log user action
  await log('frontend', 'info', 'user-interaction', 'User clicked URL shortener button');
  
  // Log validation error
  await log('frontend', 'warn', 'form-validation', 'Invalid URL format provided by user');
  
  // Log API error
  await log('frontend', 'error', 'api-request', 'Failed to shorten URL: Network timeout');
  
  // Log critical system error
  await log('frontend', 'fatal', 'system-error', 'Application crashed due to memory overflow');
  
  // Backend examples
  await log('backend', 'info', 'url-service', 'New URL created successfully');
  await log('backend', 'error', 'database', 'Failed to save URL to storage');
}

export { demonstrateLogging };
