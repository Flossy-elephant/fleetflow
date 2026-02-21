const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

router.get("/", tripController.getAllTrips);
router.post("/", tripController.createTrip);
router.post("/:id/complete", tripController.completeTrip);
router.post("/:id/cancel", tripController.cancelTrip);

module.exports = router;
