// test-dotenv.js
import 'dotenv/config';

console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY);
console.log('All env vars:', process.env);