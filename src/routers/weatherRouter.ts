import { getWeather, countWeather, topRain } from '../controllers/weatherController';
import express from 'express';
const router = express.Router();

router.get('', getWeather);
router.get('/count', countWeather);
router.get('/top-rain', topRain);

export default router;