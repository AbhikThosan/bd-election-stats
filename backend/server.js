const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { initSocket } = require("./socket");
const http = require("http");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");
const logger = require("./utils/logger");

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI); // Debug log

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/auth", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/auth/users", userRoutes);
app.use("/api/auth/notifications", notificationRoutes);

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "BD Election Stats Authentication API",
      version: "1.0.0",
      description:
        "API for user authentication, role management, and notifications",
    },
    servers: [{ url: `http://localhost:${process.env.PORT}` }],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

module.exports = { app, server };

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
