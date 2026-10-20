/**
 * Zero-dependency Node.js Load Tester for Ninja Burger
 * Run directly with: node tests/node-load-test.mjs
 */

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3100'
const CONCURRENT_USERS = 15
const TOTAL_REQUESTS = 60

console.log(`\n🚀 Starting Load Test against: ${BASE_URL}`)
console.log(`👥 Concurrent Virtual Users: ${CONCURRENT_USERS}`)
console.log(`📦 Total Requests: ${TOTAL_REQUESTS}\n`)

let completed = 0
let successful = 0
let failed = 0
const responseTimes = []

async function makeRequest(id) {
  const startTime = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { 'Accept': 'text/html' }
    })
    const duration = Date.now() - startTime
    responseTimes.push(duration)

    if (res.ok) {
      successful++
    } else {
      failed++
    }
  } catch (err) {
    failed++
  } finally {
    completed++
    process.stdout.write(`\r⏳ Completed: ${completed}/${TOTAL_REQUESTS}`)
  }
}

async function run() {
  const startAll = Date.now()
  const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i)

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift()
      await makeRequest(id)
    }
  }

  // Run concurrent workers
  await Promise.all(Array.from({ length: CONCURRENT_USERS }, () => worker()))

  const totalTimeSeconds = ((Date.now() - startAll) / 1000).toFixed(2)
  responseTimes.sort((a, b) => a - b)

  const avg = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
  const p95Index = Math.floor(responseTimes.length * 0.95)
  const p95 = responseTimes[p95Index] || responseTimes[responseTimes.length - 1]
  const min = responseTimes[0]
  const max = responseTimes[responseTimes.length - 1]
  const rps = (TOTAL_REQUESTS / totalTimeSeconds).toFixed(1)

  console.log(`\n\n================ LOAD TEST RESULTS ================`)
  console.log(`⏱️  Total Duration:      ${totalTimeSeconds}s`)
  console.log(`⚡ Requests / sec:      ${rps} req/s`)
  console.log(`✅ Success Rate:        ${((successful / TOTAL_REQUESTS) * 100).toFixed(1)}% (${successful}/${TOTAL_REQUESTS})`)
  console.log(`❌ Failed Requests:     ${failed}`)
  console.log(`📊 Response Times:`)
  console.log(`   • Fastest:           ${min} ms`)
  console.log(`   • Average:           ${avg} ms`)
  console.log(`   • 95th Percentile:   ${p95} ms`)
  console.log(`   • Slowest:           ${max} ms`)
  console.log(`====================================================\n`)

  if (p95 < 800 && failed === 0) {
    console.log(`🏆 PASSED: App responded within performance threshold (<800ms) with 0 errors!`)
  } else {
    console.log(`⚠️ Check bottlenecks above.`)
  }
}

run()
