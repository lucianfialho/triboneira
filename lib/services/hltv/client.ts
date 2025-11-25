import HLTV from 'hltv';

/**
 * HLTV Client wrapper with retry logic and error handling
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) {
      throw error;
    }

    console.log(`⚠️  Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff

    return retryWithBackoff(fn, retries - 1);
  }
}

export default HLTV;

export { retryWithBackoff };
