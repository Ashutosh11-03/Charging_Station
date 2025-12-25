const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// 🔴 IMPORTANT: Disable mongoose buffering
mongoose.set("bufferCommands", false);

const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// MongoDB Options
// --------------------
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  w: "majority",
};

// --------------------
// MongoDB Connection
// --------------------
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, mongooseOptions);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Let Render restart the service
  }
};

connectDB();

// --------------------
// MongoDB Events (Optional but useful)
// --------------------
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// --------------------
// Routes
// --------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/charging-stations", require("./routes/chargingStations"));

// --------------------
// Health Check (VERY USEFUL ON RENDER)
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// --------------------
// Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
