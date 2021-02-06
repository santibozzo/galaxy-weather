import { getWeather, countWeather, topRain } from '../controllers/weatherController';

const express = require('express');
const router = express.Router();

router.get('', getWeather);
router.get('/count', countWeather);
router.get('/top-rain', topRain);

module.exports = router;