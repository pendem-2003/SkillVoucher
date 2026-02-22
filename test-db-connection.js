const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  console.log('Testing connection to:', process.env.DATABASE_URL?.substring(0, 60) + '...');
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query result:', result.rows[0]);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
