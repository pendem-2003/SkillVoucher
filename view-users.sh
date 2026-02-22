#!/bin/bash

# View Users in Database
# This script displays all registered users

echo "👥 SkillReimburse - Registered Users"
echo "====================================="
echo ""

psql "postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable" << 'SQL'
\pset border 2
\pset format wrapped

SELECT 
  id,
  name,
  email,
  phone,
  company,
  designation,
  role,
  TO_CHAR("createdAt", 'YYYY-MM-DD HH24:MI:SS') as registered_at
FROM users 
ORDER BY "createdAt" DESC;

\echo ''
\echo 'Total Users:'
SELECT COUNT(*) as total_users FROM users;
SQL
