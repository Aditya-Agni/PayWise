import mongoose from "mongoose";
import dns from "node:dns";
import { db_name } from "../constants.js";

// Use public DNS to resolve MongoDB Atlas SRV records (fixes querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const mongooseConnection = async () => {
  try {
    const rawUrl = process.env.MONGODB_URL?.trim() || "";
    const mongoUrl = rawUrl.endsWith("/")
      ? `${rawUrl}${db_name}`
      : `${rawUrl}/${db_name}`;

    const connection = await mongoose.connect(mongoUrl);
    console.log("Connection successful at: " + connection.connection.host);
    return connection;
  } catch (error) {
    console.log("Failed to make a connection to database: " + error.message);
    process.exit(1);
  }
};
