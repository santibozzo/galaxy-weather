import WeatherModel from '../models/weatherModel';

const getWeather = (req, res) => {
    WeatherModel.find({date: req.query.date}).exec()
        .then(result => {
            res.status(200).send(result.map(doc => ({
                date: doc.date,
                weather: doc.weather,
                rainIntensity: doc.rainIntensity
            })));
        })
        .catch(error => res.status(500).send(error.message));
};

const countWeather = (req, res) => {
    WeatherModel.countDocuments({weather: req.query.weather}).exec()
        .then(result => {
            res.status(200).send({count: result});
        })
        .catch(error => res.status(500).send(error.message));
};

const topRain = (req, res) => {
    WeatherModel.find().sort({rainIntensity: -1}).limit(1).exec()
        .then(result => {
            res.status(200).send(result.map(doc => ({
                date: doc.date,
                weather: doc.weather,
                rainIntensity: doc.rainIntensity
            })));
        })
        .catch(error => res.status(500).send(error.message));
};

export { getWeather, countWeather, topRain };