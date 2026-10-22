import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { errorMiddleware } from './middleware/error.middleware.js'

export const app = express()

app.use(json({limit:"16kb"}))
app.use(urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(cors({ origin:process.env.ORIGIN , credentials:true}))

import userRoutes from './routes/user.routes.js'
app.use("/api/v1/user", userRoutes);

import transactionRoutes from './routes/transactions.routes.js'
app.use("/api/v1/transactions", transactionRoutes);

app.use((err, req, res, next) => errorMiddleware(err,req,res,next));

