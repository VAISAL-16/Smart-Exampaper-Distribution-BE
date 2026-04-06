import connectDB from "../config/db.js";
import { createApp } from "../app.js";

const app = createApp();

let connectionPromise;

export default async function handler(req, res) {
  connectionPromise ||= connectDB();
  await connectionPromise;
  return app(req, res);
}
