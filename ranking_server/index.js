require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT1 = 3000;

const cors = require("cors");
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://Subhabrata:ZvmLSTXKKv97560d@cluster0.v2zmdqn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const RatingSchema = new mongoose.Schema(
  {
    expertise: { type: [Number], default: [] },
    clarity: { type: [Number], default: [] },
    communication: { type: [Number], default: [] },
    mentorship: { type: [Number], default: [] },
  },
  { _id: false }
);

const ProjectDetailsSchema = new mongoose.Schema(
  {
    project_id: String,
    project_name: String,
  },
  { _id: false }
);

const ProfessionalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: { type: [String], default: [] },
  ratings: {
    type: RatingSchema,
    default: () => ({
      expertise: [],
      clarity: [],
      communication: [],
      mentorship: [],
    }),
  },
  rating_breakdown: {
    expertise: { type: [Number], default: [] },
    clarity: { type: [Number], default: [] },
    communication: { type: [Number], default: [] },
    mentorship: { type: [Number], default: [] },
  },
  project_details: { type: [ProjectDetailsSchema], default: [] },
  overall_score: { type: Number, default: 0 },
});

const Professional = mongoose.model("Professional", ProfessionalSchema);

// Utility function to calculate average
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// Get review count safely
const getRatingCount = (pro) =>
  Math.min(
    pro.rating_breakdown.expertise.length,
    pro.rating_breakdown.clarity.length,
    pro.rating_breakdown.communication.length,
    pro.rating_breakdown.mentorship.length
  );

app.post("/professionals", async (req, res) => {
  try {
    const { name, skills } = req.body;
    if (!name || !skills)
      return res.status(400).json({ message: "Name and skills are required" });

    const newPro = new Professional({ name, skills });
    await newPro.save();
    res.status(201).json(newPro);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/professionals/:id/rate", async (req, res) => {
  try {
    const {
      expertise,
      clarity,
      communication,
      mentorship,
      project_id,
      project_name,
    } = req.body;

    if (
      [expertise, clarity, communication, mentorship].some(
        (v) => typeof v !== "number"
      )
    ) {
      return res
        .status(400)
        .json({ message: "All rating values must be numbers" });
    }

    if (typeof project_id !== "string" || typeof project_name !== "string") {
      return res
        .status(400)
        .json({ message: "Project ID and name must be strings" });
    }

    const id = req.params.id;
    const pro = await Professional.findById(id);
    if (!pro)
      return res.status(404).json({ message: "Professional not found" });

    const isDuplicateProject = pro.project_details.some(
      (p) =>
        p.project_id.trim().toLowerCase() === project_id.trim().toLowerCase() ||
        p.project_name.trim().toLowerCase() ===
          project_name.trim().toLowerCase()
    );

    if (isDuplicateProject) {
      return res
        .status(400)
        .json({
          message: "Duplicate project_id or project_name entry not allowed",
        });
    }

    // Push new ratings
    pro.rating_breakdown.expertise.push(expertise);
    pro.rating_breakdown.clarity.push(clarity);
    pro.rating_breakdown.communication.push(communication);
    pro.rating_breakdown.mentorship.push(mentorship);

    // Calculate updated individual averages
    const avgExpertise = parseFloat(
      avg(pro.rating_breakdown.expertise).toFixed(2)
    );
    const avgClarity = parseFloat(avg(pro.rating_breakdown.clarity).toFixed(2));
    const avgCommunication = parseFloat(
      avg(pro.rating_breakdown.communication).toFixed(2)
    );
    const avgMentorship = parseFloat(
      avg(pro.rating_breakdown.mentorship).toFixed(2)
    );

    pro.ratings.expertise = [avgExpertise];
    pro.ratings.clarity = [avgClarity];
    pro.ratings.communication = [avgCommunication];
    pro.ratings.mentorship = [avgMentorship];

    // Individual rating R
    const R =
      (avgExpertise + avgClarity + avgCommunication + avgMentorship) / 4;
    const v = getRatingCount(pro); // Number of ratings for this professional

    // Compute global average C
    const professionals = await Professional.find();
    let totalSum = 0;
    let totalCount = 0;

    for (const prof of professionals) {
      const count = getRatingCount(prof);
      if (count > 0) {
        const r_avg =
          (avg(prof.rating_breakdown.expertise) +
            avg(prof.rating_breakdown.clarity) +
            avg(prof.rating_breakdown.communication) +
            avg(prof.rating_breakdown.mentorship)) /
          4;
        totalSum += r_avg * count;
        totalCount += count;
      }
    }

    const C = totalCount ? totalSum / totalCount : R;
    const m = 5; // Tweakable parameter

    const WR = (v / (v + m)) * R + (m / (v + m)) * C;
    pro.overall_score = parseFloat(WR.toFixed(2));

    pro.project_details.push({ project_id, project_name });

    await pro.save();
    res.json(pro);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/professionals", async (req, res) => {
  try {
    const professionals = await Professional.find();
    res.json(professionals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/professionals/:id", async (req, res) => {
  try {
    const pro = await Professional.findById(req.params.id);
    if (!pro) return res.status(404).json({ message: "Not found" });
    res.json(pro);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/ranking", async (req, res) => {
  try {
    const rankedProfessionals = await Professional.find(
      {},
      "name overall_score"
    ).sort({ overall_score: -1 });
    res.json(rankedProfessionals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.listen(PORT1, () =>
  console.log(`API running on http://localhost:${PORT1}`)
);
