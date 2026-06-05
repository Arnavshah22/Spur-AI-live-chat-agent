#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Free Tier
 * 
 * Pings the deployed backend every 10 minutes to prevent it from spinning down.
 * Run this script on your local machine or a server.
 * 
 * Usage:
 *   node keep-alive.js
 * 
 * Or make it run in background:
 *   node keep-alive.js &
 */

const BACKEND_URL = 'https://spur-ai-live-chat-agent-t3nv.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

let pingCount = 0;
let successCount = 0;
let failCount = 0;

async function ping() {
  pingCount++;
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] Ping #${pingCount}: Checking ${BACKEND_URL}/api/health...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Keep-Alive-Script/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      successCount++;
      const data = await response.json();
      console.log(`✅ [${timestamp}] Server is alive! Status: ${data.status}`);
      console.log(`   Stats: ${successCount} successful, ${failCount} failed out of ${pingCount} total pings\n`);
    } else {
      failCount++;
      console.log(`⚠️  [${timestamp}] Server responded with status ${response.status}`);
      console.log(`   Stats: ${successCount} successful, ${failCount} failed out of ${pingCount} total pings\n`);
    }
    
  } catch (error) {
    failCount++;
    
    if (error.name === 'AbortError') {
      console.error(`❌ [${timestamp}] Ping timeout after 30 seconds`);
    } else {
      console.error(`❌ [${timestamp}] Ping failed:`, error.message);
    }
    
    console.log(`   Stats: ${successCount} successful, ${failCount} failed out of ${pingCount} total pings\n`);
  }
}

// Initial ping
console.log('🚀 Starting keep-alive script...');
console.log(`   Target: ${BACKEND_URL}`);
console.log(`   Interval: ${PING_INTERVAL / 1000 / 60} minutes`);
console.log(`   Press Ctrl+C to stop\n`);

ping();

// Set up interval
const intervalId = setInterval(ping, PING_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping keep-alive script...');
  console.log(`Final stats: ${successCount} successful, ${failCount} failed out of ${pingCount} total pings`);
  clearInterval(intervalId);
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught error:', error);
  console.log('Script will continue running...\n');
});
