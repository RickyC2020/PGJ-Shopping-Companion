/**
 * Scan Rate Limiting & Bot Defense Module
 * Defense #4: Blocks automated price scraping with token-bucket / sliding-window
 * rate limiting and strict client header verification.
 */

// In-memory sliding window request store: Map<clientId, number[]>
const requestWindows = new Map();

// Known scraper / bot user-agent patterns
const BOT_USER_AGENTS = [
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python/i,
  /scrapy/i,
  /postman/i,
  /httpclient/i,
  /aiohttp/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i
];

export const DEFAULT_RATE_LIMIT = {
  maxRequests: 10,     // Max allowed scans
  windowMs: 10000      // 10 second window
};

/**
 * Checks sliding window rate limit for a client.
 * @param {string} clientId Identifier such as session token or IP address
 * @param {typeof DEFAULT_RATE_LIMIT} [options]
 * @param {number} [now=Date.now()]
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number, currentCount: number }}
 */
export function checkRateLimit(clientId = 'anonymous', options = DEFAULT_RATE_LIMIT, now = Date.now()) {
  const { maxRequests, windowMs } = { ...DEFAULT_RATE_LIMIT, ...options };

  const history = requestWindows.get(clientId) || [];
  const windowStart = now - windowMs;

  // Purge records older than the active window
  const activeHistory = history.filter(ts => ts > windowStart);

  if (activeHistory.length >= maxRequests) {
    const oldestInWindow = activeHistory[0];
    const retryAfterMs = Math.max(0, oldestInWindow + windowMs - now);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      currentCount: activeHistory.length
    };
  }

  // Record this request
  activeHistory.push(now);
  requestWindows.set(clientId, activeHistory);

  return {
    allowed: true,
    remaining: maxRequests - activeHistory.length,
    retryAfterSeconds: 0,
    currentCount: activeHistory.length
  };
}

/**
 * Resets rate limit records (useful for test isolation).
 */
export function resetRateLimits() {
  requestWindows.clear();
}

/**
 * Verifies HTTP request headers to block bot scrapers.
 * Requires genuine mobile app signatures and rejects common scraping tools.
 * @param {Record<string, string>} headers
 * @returns {{ isAuthorized: boolean, reason?: string }}
 */
export function verifyBotDefenseHeaders(headers = {}) {
  // Normalize header keys to lowercase
  const normalized = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = String(v || '').trim();
  }

  const userAgent = normalized['user-agent'] || '';
  const requestedWith = normalized['x-requested-with'] || '';
  const clientSession = normalized['x-client-session'] || '';

  // 1. Check for missing User-Agent
  if (!userAgent) {
    return {
      isAuthorized: false,
      reason: 'Missing User-Agent header: automated clients prohibited'
    };
  }

  // 2. Check for known bot / scraper User-Agents
  for (const botPattern of BOT_USER_AGENTS) {
    if (botPattern.test(userAgent)) {
      return {
        isAuthorized: false,
        reason: `Scraping bot detected: User-Agent matches disallowed tool (${userAgent})`
      };
    }
  }

  // 3. Check for required application signature header
  if (requestedWith !== 'PGJ-Mobile-App') {
    return {
      isAuthorized: false,
      reason: 'Missing or invalid X-Requested-With header: expected PGJ-Mobile-App'
    };
  }

  // 4. Ensure client session identifier is present
  if (!clientSession) {
    return {
      isAuthorized: false,
      reason: 'Missing X-Client-Session verification token'
    };
  }

  return { isAuthorized: true };
}
