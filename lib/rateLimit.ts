import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory sliding window cache fallback (per serverless instance / Node server)
const memoryStore = new Map<string, RateLimitRecord>()

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    memoryStore.forEach((record, key) => {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    })
  }, 5 * 60 * 1000).unref?.()
}

export interface RateLimitOptions {
  limit: number // Max number of allowed requests in the window
  windowSeconds: number // Time window in seconds
  identifier: string // Unique identifier, e.g. IP address or userId + route
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Extracts client IP address accurately from standard proxy/CDN headers
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/**
 * Rate Limiter function
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in .env,
 * it uses distributed Redis. Otherwise, it safely uses the built-in memory store.
 */
export async function rateLimit({
  limit,
  windowSeconds,
  identifier,
}: RateLimitOptions): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  // Option A: Upstash Redis (if configured by user)
  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${identifier}`
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSeconds],
        ]),
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        const currentCount = Number(data[0]?.result ?? 1)
        const success = currentCount <= limit
        return {
          success,
          remaining: Math.max(0, limit - currentCount),
          reset: Math.floor(Date.now() / 1000) + windowSeconds,
        }
      }
    } catch (e) {
      console.warn('[RateLimit] Upstash error, falling back to memory store:', e)
    }
  }

  // Option B: Zero-dependency In-Memory Sliding Counter
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = memoryStore.get(identifier)

  if (!record || now > record.resetTime) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    }
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    }
  }

  record.count += 1
  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  }
}

/**
 * Returns a standard HTTP 429 Too Many Requests response with headers
 */
export function rateLimitExceededResponse(
  message = 'تم تجاوز الحد المسموح من المحاولات. برجاء المحاولة لاحقاً بعد قليل.'
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    }
  )
}
