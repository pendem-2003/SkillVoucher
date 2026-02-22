// Temporary in-memory user storage (replace with database later)
// This allows the app to work without a database connection for testing

export const users = new Map<string, any>();

// Add a demo user for testing
users.set('demo@example.com', {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of "demo123"
  phone: '+1234567890',
  company: 'Demo Company',
  designation: 'Developer',
  role: 'USER',
  createdAt: new Date().toISOString(),
});
