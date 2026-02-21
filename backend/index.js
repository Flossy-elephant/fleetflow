const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tripRoutes = require("./routes/trips");
const driverRoutes = require("./routes/drivers");
const vehicleRoutes = require("./routes/vehicles");
const analyticsRoutes = require("./routes/analytics");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("FleetFlow Backend 🚀"));

// Routes
app.use("/trips", tripRoutes);
app.use("/drivers", driverRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));