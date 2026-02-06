import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { apiRouter } from "./routes/items.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.LOG_FORMAT || "dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
