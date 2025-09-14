import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();
const app = express();

// Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet()); // Add security headers
app.use(limiter); // Apply rate limiting

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL // Use specific origin in production
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST'], // Only allow needed methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard middleware
app.use(express.json({ limit: '10kb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Serve static files with security headers
app.use(express.static("public", {
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));
app.set("view engine", "ejs");

// MongoDB
// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Database connection error:', err));

// Import middleware
import { authMiddleware } from "./middleware/auth.js";

// Authentication routes
app.use("/auth", authRoutes);

// Public routes
app.get("/auth/login", (req, res) => res.render("login"));
app.get("/auth/signup", (req, res) => res.render("signup"));

// Protected routes
app.get("/dashboard", authMiddleware, (req, res) => {
  res.render("dashboard", { user: req.user });
});


const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  // Join user's personal room for private notifications
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Attach io to app for use in routes
app.set('io', io);

httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
