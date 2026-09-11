import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import sequelize, { connectDB } from "./config/db.js";
import "./models/association.js";
import { User } from "./models/association.js";

dotenv.config();

async function seedAdmin() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "password123";
  const firstname = process.env.ADMIN_FIRSTNAME || "Admin";
  const lastname = process.env.ADMIN_LASTNAME || "User";

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log(`Admin account created: ${email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
