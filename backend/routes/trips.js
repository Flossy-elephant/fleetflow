const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

router.post("/", tripController.createTrip);
router.post("/:id/complete", tripController.completeTrip);

module.exports = router;