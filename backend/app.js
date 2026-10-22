import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { errorMiddleware } from './middleware/error.middleware.js'

export const app = express()

const configuredOrigins = (process.env.ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = new Set(
  process.env.NODE_ENV === "production" ? configuredOrigins : [...developmentOrigins, ...configuredOrigins],
);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header include same-origin calls and tools such as Postman.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(json({limit:"16kb"}))
app.use(urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions));

import userRoutes from './routes/user.routes.js'
app.use("/api/v1/user", userRoutes);

import transactionRoutes from './routes/transactions.routes.js'
app.use("/api/v1/transactions", transactionRoutes);

import recurringPaymentRoutes from './routes/recurringPayment.routes.js'
app.use("/api/v1/recurring-payments", recurringPaymentRoutes);

import aiRoutes from './routes/ai.routes.js'
app.use("/api/v1/ai", aiRoutes);

app.use((err, req, res, next) => errorMiddleware(err,req,res,next));

