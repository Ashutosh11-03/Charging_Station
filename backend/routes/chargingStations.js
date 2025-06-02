const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

// Create a new charging station
router.post('/', auth, async (req, res) => {
  try {
    const station = new ChargingStation({
      ...req.body,
      createdBy: req.user.id
    });
    const savedStation = await station.save();
    res.status(201).json(savedStation);
  } catch (error) {
    res.status(400).json({ error: 'Error creating charging station' });
  }
});

// Get all charging stations
router.get('/', auth, async (req, res) => {
  try {
    const { status, connectorType } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    if (connectorType) {
      query.connectorType = connectorType;
    }

    const stations = await ChargingStation.find(query);
    // Add isOwner flag to each station
    res.json(stations.map(station => ({
      ...station.toObject(),
      isOwner: station.createdBy.toString() === req.user.id
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching charging stations' });
  }
});

// Get a specific charging station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a charging station
router.put('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    // Check if the user is the owner of the station
    if (station.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this station' });
    }

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedStation);
  } catch (error) {
    res.status(400).json({ error: 'Error updating charging station' });
  }
});

// Delete a charging station
router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    // Check if the user is the owner of the station
    if (station.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this station' });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charging station deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting charging station' });
  }
});

module.exports = router; 