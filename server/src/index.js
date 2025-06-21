import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../db/db.js";
import userRoutes from "../routes/user.js";
import companyRoutes from "../routes/company.js";
import projectRoutes from "../routes/projects.js";
import taskRoutes from "../routes/task.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

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
