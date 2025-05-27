const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDb = require("./src/config/database");
const authRouter = require("./src/routes/auth");
const bugRouter = require("./src/routes/bug");
const chatRouter = require("./src/routes/chat");
require("dotenv").config();
const cors = require("cors");
const fixRequestRouter = require("./src/routes/request");
const http = require("http");
const initializeSockets = require("./src/utils/socket");

const server = http.createServer(app);
initializeSockets(server);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use("/", authRouter);
app.use("/", bugRouter);
app.use("/", fixRequestRouter);
app.use("/", chatRouter);

const PORT = process.env.PORT;
connectDb()
  .then(() => {
    console.log("Connected to Database");
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
