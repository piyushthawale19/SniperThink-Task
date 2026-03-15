require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { initDB } = require("./config/db");
const routes = require("./routes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  allowedOrigins.length > 0
    ? {
        origin(origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
      }
    : {
        origin: true,
      };

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 4000;
const startServer = async () => {
  const dbReady = await initDB();
  if (!dbReady) {
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
