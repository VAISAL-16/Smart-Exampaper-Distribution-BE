import "dotenv/config";
import connectDB from "./config/db.js";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 5000);

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
