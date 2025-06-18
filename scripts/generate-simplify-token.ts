import crypto from 'crypto';

// Generate a random 32-byte token and convert it to hex
const token = crypto.randomBytes(32).toString('hex');
console.log('Generated Simplify Webhook Token:');
console.log(token);
console.log('\nAdd this to your .env.local file as:');
console.log('SIMPLIFY_WEBHOOK_TOKEN=' + token); 