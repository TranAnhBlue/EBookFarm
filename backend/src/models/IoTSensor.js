const mongoose = require('mongoose');

const iotSensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['weather_station', 'soil_sensor', 'water_sensor', 'camera_ai'], 
    required: true 
  },
  locationName: { type: String, default: 'Lô Sầu Riêng HTX Tân Quan' },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  plantingRegionCode: { type: String, default: 'MSVT-TQ-001' },
  readings: {
    // Weather station readings
    airTemperature: { type: Number }, // °C
    airHumidity: { type: Number },    // %
    rainfall: { type: Number },       // mm
    windSpeed: { type: Number },      // km/h
    uvIndex: { type: Number },

    // Soil sensor readings (speficially tuned for Durian: pH 5.5-6.5, EC 1.0-1.8 mS/cm)
    soilMoisture20cm: { type: Number }, // %
    soilMoisture50cm: { type: Number }, // %
    soilPh: { type: Number },           // pH level
    soilEc: { type: Number },           // mS/cm
    soilTemperature: { type: Number },  // °C

    // Water sensor readings
    waterLevel: { type: Number },       // cm
    waterPh: { type: Number },

    batteryLevel: { type: Number, default: 98 }, // %
    signalStrength: { type: Number, default: 92 } // %
  },
  status: {
    type: String,
    enum: ['online', 'warning', 'offline', 'maintenance'],
    default: 'online'
  },
  lastWarning: {
    title: { type: String },
    message: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    timestamp: { type: Date }
  },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('IoTSensor', iotSensorSchema);
