import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import { seedTestSession } from "./services/sessionService.js";
import { initScheduler } from "./services/schedulerService.js";
import attachSignaling from "./websocket/signaling.js";
import passport from "passport";
import session from "express-session";
import "./config/passport.js"; // Import passport config

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expertRoutes from "./routes/expertRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userAdminRoutes from './routes/userAdminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


import categoryRoutes from "./routes/categoryRoutes.js";
import aiSessionRoutes from "./routes/aiSessionRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";

import pricingRoutes from "./routes/pricingRoutes.js";
import savedExpertRoutes from "./routes/savedExpertRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

await connectDB();
// Seeding on startup
await seedTestSession();
initScheduler();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://interviewmock.vercel.app",
  "https://www.interviewmock.vercel.app",
  "https://ownproject-interview.vercel.app",
  "https://www.ownproject-interview.vercel.app",
  "https://interviewmock.onrender.com",
  "https://ownproject-interview.onrender.com",
  "https://mockeefy.com",
  "https://www.mockeefy.com",
  "https://mockeefy.onrender.com", // Backend direct access
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "userid"],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());

// Security headers for Google Auth (COOP/COEP) - REMOVED to fix net::ERR_FAILED
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//   res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
//   next();
// });

// Enable trust proxy for Render/Heroku (required for secure cookies)
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const io = new Server(httpServer, {
  cors: {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);

      // Check against allowedOrigins
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      console.log(`[CORS] Blocked origin: ${requestOrigin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

attachSignaling(io);

// Middleware
app.use(express.json());



// serve uploaded images (dev)
app.use("/uploads/profileImages", express.static(path.join(process.cwd(), "uploads/profileImages")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// mount routers
// mount routers
app.use("/api/auth", authRoutes);
app.use("/api/expert", expertRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai-interview', aiSessionRoutes);
app.use('/api/admin/users', userAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/user/saved-experts', savedExpertRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/jobs', jobRoutes);



const PORT = process.env.PORT || 5000;

// Serve static assets in production
// Serve static assets in production
// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
//   // Serve static files from the client/dist directory
//   // app.use(express.static(path.join(process.cwd(), '../client/dist')));

//   // Handle SPA routing: serve index.html for any unknown routes
//   // app.get('*', (req, res) => {
//   //   res.sendFile(path.join(process.cwd(), '../client/dist/index.html'));
//   // });
// }

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
