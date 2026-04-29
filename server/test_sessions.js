import 'dotenv/config';
import mongoose from 'mongoose';
import Session from './models/Session.js';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const sessions = await Session.find();
  console.log('Total sessions:', sessions.length);
  for(let s of sessions) {
    console.log(`- ${s.sessionId}: status=${s.status}, price=${s.price}, payoutAmount=${s.payoutAmount}, expertId=${s.expertId}`);
  }
  process.exit();
}).catch(console.error);
