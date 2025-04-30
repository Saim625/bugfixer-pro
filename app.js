const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDb = require("./src/config/database");
const authRouter = require("./src/routes/auth");
require("dotenv").config();
const cors = require("cors");

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/", authRouter);
const PORT = process.env.PORT;
connectDb()
  .then(() => {
    console.log("Connected to Database");
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
