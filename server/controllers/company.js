import { Company } from "../models/company.js";
import { sendWelcomeEmail } from "../utils/mailer.js";

export const onboardCompany = async (req, res) => {
  try {
    const { name, email, companyId, logo } = req.body;

    if (!name || !email || !companyId || !logo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      if (existingCompany.isOnboarded) {
        return res.status(400).json({ message: "Company already onboarded" });
      }
      // Update existing company and set isOnboarded true
      existingCompany.name = name;
      existingCompany.companyId = companyId;
      existingCompany.logo = logo;
      existingCompany.isOnboarded = true;
      await existingCompany.save();
      await sendWelcomeEmail(email, name);
      return res
        .status(200)
        .json({ message: "Company onboarded successfully", company: existingCompany });
    }

    // New company
    const newCompany = new Company({
      name,
      email,
      companyId,
      logo,
      isOnboarded: true,
    });

    await newCompany.save();

    await sendWelcomeEmail(email, name);
    return res
      .status(201)
      .json({ message: "Company onboarded successfully", company: newCompany });
  } catch (error) {
    console.error("Error in onboardCompany:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
