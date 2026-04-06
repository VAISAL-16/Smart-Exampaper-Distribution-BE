import connectDB from "../config/db.js";
import { createApp } from "../app.js";

const app = createApp();

let connectionPromise;

export default async function handler(req, res) {
  try {
    connectionPromise ||= connectDB().catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
    await connectionPromise;
    return app(req, res);
  } catch (error) {
    console.error("Serverless startup failed", error);
    return res.status(500).json({
      success: false,
      message: "Backend startup failed",
      error: error.message
    });
  }
}
