const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create users
  const hashedPwd = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "manager@fleetflow.com" },
    update: {},
    create: { email: "manager@fleetflow.com", password: hashedPwd, name: "Fleet Manager", role: "MANAGER" },
  });
  await prisma.user.upsert({
    where: { email: "dispatcher@fleetflow.com" },
    update: {},
    create: { email: "dispatcher@fleetflow.com", password: hashedPwd, name: "John Dispatcher", role: "DISPATCHER" },
  });

  // Vehicles
  const vehicles = [
    { name: "Van-01", licensePlate: "MH-12-AB-1234", make: "Tata", model: "Ace", type: "VAN", maxCapacity: 500, odometer: 12500, acquisitionCost: 800000, status: "AVAILABLE" },
    { name: "Truck-02", licensePlate: "MH-12-CD-5678", make: "Ashok Leyland", model: "DOST+", type: "TRUCK", maxCapacity: 2000, odometer: 45200, acquisitionCost: 2500000, status: "AVAILABLE" },
    { name: "Van-03", licensePlate: "MH-12-EF-9012", make: "Mahindra", model: "Supro", type: "VAN", maxCapacity: 750, odometer: 8900, acquisitionCost: 950000, status: "ON_TRIP" },
    { name: "Truck-04", licensePlate: "MH-12-GH-3456", make: "Tata", model: "407", type: "TRUCK", maxCapacity: 3000, odometer: 78000, acquisitionCost: 3200000, status: "IN_SHOP" },
    { name: "Bike-05", licensePlate: "MH-12-IJ-7890", make: "Hero", model: "Splendor", type: "BIKE", maxCapacity: 50, odometer: 22000, acquisitionCost: 75000, status: "AVAILABLE" },
    { name: "Van-06", licensePlate: "MH-12-KL-2345", make: "Force", model: "Traveller", type: "VAN", maxCapacity: 900, odometer: 33000, acquisitionCost: 1200000, status: "AVAILABLE" },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({ where: { licensePlate: v.licensePlate }, update: {}, create: v });
  }

  // Drivers
  const drivers = [
    { name: "Rajesh Kumar", licenseNumber: "MH0120190012345", licenseExpiry: new Date("2027-06-15"), phone: "9876543210", status: "ON_DUTY", safetyScore: 95, totalTrips: 48, completedTrips: 46, onTimeTrips: 42, violations: 1 },
    { name: "Suresh Patil", licenseNumber: "MH0120180054321", licenseExpiry: new Date("2026-03-20"), phone: "9765432109", status: "ON_TRIP", safetyScore: 88, totalTrips: 62, completedTrips: 58, onTimeTrips: 50, violations: 3 },
    { name: "Amit Singh", licenseNumber: "MH0120200098765", licenseExpiry: new Date("2028-11-30"), phone: "9654321098", status: "ON_DUTY", safetyScore: 92, totalTrips: 35, completedTrips: 34, onTimeTrips: 32, violations: 0 },
    { name: "Priya Sharma", licenseNumber: "MH0120210011111", licenseExpiry: new Date("2029-04-10"), phone: "9543210987", status: "OFF_DUTY", safetyScore: 97, totalTrips: 22, completedTrips: 22, onTimeTrips: 21, violations: 0 },
    { name: "Vikram Rao", licenseNumber: "MH0120170022222", licenseExpiry: new Date("2025-01-15"), phone: "9432109876", status: "SUSPENDED", safetyScore: 62, totalTrips: 90, completedTrips: 74, onTimeTrips: 55, violations: 8 },
  ];

  for (const d of drivers) {
    await prisma.driver.upsert({ where: { licenseNumber: d.licenseNumber }, update: {}, create: d });
  }

  // Get created entities
  const allVehicles = await prisma.vehicle.findMany();
  const allDrivers = await prisma.driver.findMany({ where: { status: { in: ["ON_DUTY", "ON_TRIP"] } } });

  // Trips
  const tripData = [
    { vehicleId: allVehicles[2].id, driverId: allDrivers[1].id, cargoWeight: 450, distanceKm: 120, revenue: 8500, status: "DISPATCHED", origin: "Mumbai Central Depot", destination: "Pune Distribution Hub", startOdometer: 8900 },
    { vehicleId: allVehicles[0].id, driverId: allDrivers[0].id, cargoWeight: 320, distanceKm: 85, revenue: 6200, status: "COMPLETED", origin: "Thane Warehouse", destination: "Nashik Hub", startOdometer: 12000, endOdometer: 12085, completedAt: new Date(Date.now() - 86400000) },
    { vehicleId: allVehicles[1].id, driverId: allDrivers[2].id, cargoWeight: 1800, distanceKm: 200, revenue: 22000, status: "COMPLETED", origin: "Mumbai Port", destination: "Aurangabad Factory", startOdometer: 44900, endOdometer: 45100, completedAt: new Date(Date.now() - 172800000) },
    { vehicleId: allVehicles[0].id, driverId: allDrivers[0].id, cargoWeight: 280, distanceKm: 60, revenue: 4500, status: "DRAFT", origin: "Dadar Depot", destination: "Kalyan Hub", scheduledAt: new Date(Date.now() + 86400000) },
  ];

  for (const t of tripData) {
    await prisma.trip.create({ data: t });
  }

  // Maintenance logs
  await prisma.maintenanceLog.create({
    data: { vehicleId: allVehicles[3].id, description: "Full engine overhaul - scheduled service", cost: 45000, status: "OPEN" },
  });
  await prisma.maintenanceLog.create({
    data: { vehicleId: allVehicles[0].id, description: "Oil change + tyre rotation", cost: 3500, status: "CLOSED", closedAt: new Date(Date.now() - 259200000) },
  });

  // Fuel logs
  const fuelData = [
    { vehicleId: allVehicles[0].id, liters: 45, cost: 4275, pricePerL: 95.0, odometer: 12300 },
    { vehicleId: allVehicles[1].id, liters: 120, cost: 11400, pricePerL: 95.0, odometer: 44800 },
    { vehicleId: allVehicles[2].id, liters: 55, cost: 5225, pricePerL: 95.0, odometer: 8700 },
    { vehicleId: allVehicles[4].id, liters: 8, cost: 760, pricePerL: 95.0, odometer: 21900 },
    { vehicleId: allVehicles[5].id, liters: 60, cost: 5700, pricePerL: 95.0, odometer: 32800 },
  ];

  for (const f of fuelData) {
    await prisma.fuelLog.create({ data: f });
  }

  console.log("✅ Database seeded successfully!");
  console.log("📧 Login: manager@fleetflow.com / password123");
  console.log("📧 Login: dispatcher@fleetflow.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
