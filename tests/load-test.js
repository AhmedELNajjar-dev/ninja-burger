import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users (smoke test)
    { duration: '1m', target: 20 },   // Average lunch hour rush
    { duration: '30s', target: 50 },  // Traffic spike
    { duration: '20s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must complete under 800ms
    http_req_failed: ['rate<0.01'],   // Error rate must be under 1%
  },
}

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3100'

export default function () {
  // 1. Visit homepage (menu catalog)
  const homeRes = http.get(`${BASE_URL}/`)
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'menu loads fast': (r) => r.timings.duration < 800,
  })

  sleep(1)

  // 2. Fetch cart endpoint
  const cartRes = http.get(`${BASE_URL}/api/cart`)
  check(cartRes, {
    'cart endpoint returns 200': (r) => r.status === 200,
  })

  sleep(2)
}
