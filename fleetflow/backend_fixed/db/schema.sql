-- Run this in psql to create your tables if they don't exist yet

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  max_capacity FLOAT NOT NULL,
  odometer FLOAT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Available',
  acquisition_cost FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_expiry DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'OnDuty',
  safety_score FLOAT DEFAULT 100,
  total_trips INT DEFAULT 0,
  completed_trips INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  cargo_weight FLOAT,
  distance_km FLOAT DEFAULT 0,
  revenue FLOAT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Dispatched',
  start_odometer FLOAT,
  end_odometer FLOAT,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  description TEXT,
  cost FLOAT,
  date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'Open',
  closed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fuel_log (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  liters FLOAT,
  cost FLOAT,
  date TIMESTAMP DEFAULT NOW()
);
