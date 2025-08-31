// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const registerRoute = require("./routes/register");
app.use("/api/register", registerRoute);

// health
app.get("/", (req, res) => res.send("Hackathon Registration API Running"));

// connect and start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, { })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });
