const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fleetflow1",
  password: "arjun1720",
  port: 5432,
});

module.exports = pool;