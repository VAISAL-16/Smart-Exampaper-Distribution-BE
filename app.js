import "dotenv/config";
import express from "express";
import cors from "cors";
import storeRoutes from "./routes/storeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import { requestContext } from "./middleware/requestContext.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { sendSuccess } from "./utils/apiResponse.js";

const nodeEnv = process.env.NODE_ENV || "development";
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
const corsOrigin = process.env.CORS_ORIGIN || "*";


export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: corsOrigin === "*" ? true : corsOrigin,
      credentials: true
    })
  );
  app.use(requestContext);
  app.use(express.json({ limit: requestBodyLimit }));

  app.get("/", (_req, res) => {
    sendSuccess(res, { service: "Smart Exam Distribution API" }, "API running");
  });

  app.get("/health", (_req, res) => {
    sendSuccess(
      res,
      {
        status: "ok",
        environment: nodeEnv,
        uptimeSeconds: Math.round(process.uptime())
      },
      "Health check passed"
    );
  });

  app.use("/api/store", storeRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/centers", centerRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
