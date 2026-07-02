const express = require('express');
const router = express.Router();
const { fetchDepots, fetchVehicles } = require('../services/apiService');
const { solveKnapsack } = require('../utils/knapsack');
const logger = require('../config/logger');

router.get('/schedule', async (req, res, next) => {
  try {
    logger.info('GET /schedule - Initiating scheduling workflow...');

    const [depots, vehicles] = await Promise.all([
      fetchDepots(),
      fetchVehicles()
    ]);

    logger.info(`GET /schedule - Fetched ${depots.length} depots and ${vehicles.length} vehicles.`);

    const results = depots.map((depot) => {
      logger.info(`GET /schedule - Solving knapsack for Depot ID: ${depot.ID} with Capacity: ${depot.MechanicHours}`);
      
      const { SelectedTasks, TotalDuration, TotalImpact } = solveKnapsack(
        vehicles,
        depot.MechanicHours
      );

      return {
        DepotID: depot.ID,
        MechanicHours: depot.MechanicHours,
        SelectedTasks,
        TotalDuration,
        TotalImpact
      };
    });

    logger.info('GET /schedule - Schedule calculation completed successfully.');
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
