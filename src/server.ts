import dotenv from "dotenv";
dotenv.config();

import http from "http";
import mongoose from "mongoose";

import app from "./app";
import config from "./config";
import logger from "./logger";
import "./modules/enrollCourse/enrollCourse.cron";

let httpServer: http.Server | null = null;

async function main() {
  try {
    if (!config.mongodbUrl || config.mongodbUrl === "add mongodb") {
      logger.warn(
        "MONGODB_URL is not configured in .env. Please update MONGODB_URL in your .env file.",
      );
    } else {
      await mongoose.connect(config.mongodbUrl as string);
      logger.info("MongoDB connected successfully");
    }

    const port = config.port || 5000;
    httpServer = http.createServer(app);

    httpServer.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error: any) {
    logger.error(error, "Server failed to start");
  }
}

const handleExit = () => {
  if (httpServer) {
    httpServer.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);

main();
