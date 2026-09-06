import app from "./app.js";

import sequelize, { connectDB } from "./config/db.js";
import "./models/association.js";

import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Exits the process when the database is unreachable
await connectDB();

try {
    await sequelize.sync();
}
catch (error) {
    console.error("Database sync failed:", error.message);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});