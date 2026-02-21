const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tripRoutes = require("./routes/trips");
const driverRoutes = require("./routes/drivers");
const vehicleRoutes = require("./routes/vehicles");
const analyticsRoutes = require("./routes/analytics");
const maintenanceRoutes = require("./routes/maintenance");
const fuelRoutes = require("./routes/fuel");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("FleetFlow Backend 🚀"));

app.use("/trips", tripRoutes);
app.use("/drivers", driverRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/fuel", fuelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
