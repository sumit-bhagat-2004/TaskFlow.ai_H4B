import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../db/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
