import mongoose from 'mongoose';
import moment from 'moment';

import WeatherModel, {IWeatherModel} from '../models/weatherModel';

const connection = mongoose.connection;
const FERENGI_DISTANCE = 500;
const BETASOIDE_DISTANCE = 2000;
const VULCANO_DISTANCE = 1000;
const SUN_POSITION = {x: 0, y: 0};
const WEATHER_DRY = 'dry';
const WEATHER_HUMID = 'humid';
const WEATHER_RAINY = 'rainy';
const WEATHER_PERFECT = 'perfect temperature and pression';

const initializeDataBase = () => {
    connection.db.collection('weather').countDocuments()
        .then(count => {
            if(count === 0) {
                populateWeather().then(() => console.log('DB initialized'));
            }
        })
};

interface Point {
    x: number,
    y: number
}

interface Planet extends Point {
    degree: number
}

const roundNumber = (n: number): number => {
    return Math.round((n + Number.EPSILON) * 1000) / 1000;
};

const cos = (degree: number): number => {
    const result = Math.cos(degree * (Math.PI / 180));
    return [0, 90, 180, 270, 360].includes(degree)
        ? roundNumber(result)
        : result;
};

const sin = (degree: number): number => {
    const result = Math.sin(degree * (Math.PI / 180));
    return [0, 90, 180, 270, 360].includes(degree)
        ? roundNumber(result)
        : result;
};

const getPlanetPosition = (radius: number, degree: number): Planet => {
    let actualDegree: number = degree;
    if(actualDegree > 360) {
        actualDegree = actualDegree - 360;
    }
    return {
        x: radius * cos(actualDegree),
        y: radius * sin(actualDegree),
        degree: actualDegree
    };
};

const getM = (planet1: Planet, planet2: Planet): number => {
    return (planet1.y - planet2.y) / (planet1.x - planet2.x);
};

const getB = (planet: Planet, m: number): number => {
    return planet.y - m * planet.x;
};

const arePlanetsAligned = (planet1: Planet, planet2: Planet, planet3: Planet): boolean => {
    if((planet1.x === planet2.x && planet1.x === planet3.x) || (planet1.y === planet2.y && planet1.y === planet3.y)) {
        return true;
    }
    const m = getM(planet1, planet2);
    const b = getB(planet1, m);
    return planet3.y === (m * planet3.x + b);
};

const isSameAngleLine = (planet1: Planet, planet2: Planet): boolean => {
    return planet1.degree === planet2.degree || planet1.degree === planet2.degree - 180 || planet1.degree === planet2.degree + 180;
};

const arePlanetsAlignedWithSun = (planet1: Planet, planet2: Planet, planet3: Planet): boolean => {
    return isSameAngleLine(planet1, planet2) && isSameAngleLine(planet1, planet3);
};

const sign = (p1: Point, p2: Point, p3: Point): number => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

const isSunInsidePlanets = (planet1: Planet, planet2: Planet, planet3: Planet): boolean => {
    const d1 = sign(SUN_POSITION, planet1, planet2);
    const d2 = sign(SUN_POSITION, planet2, planet3);
    const d3 = sign(SUN_POSITION, planet3, planet1);

    const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
};

const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};


const populateWeather = async () => {
    let day = moment();
    const tenYears = moment().add(10, 'years');
    let ferengi: Planet = {x: 0, y: FERENGI_DISTANCE, degree: 90};
    let betasoide: Planet = {x: 0, y: BETASOIDE_DISTANCE, degree: 90};
    let vulcano: Planet = {x: 0, y: VULCANO_DISTANCE, degree: 90};
    let toSave: IWeatherModel[] = [];
    let weather: string;
    let rainIntensity: number;

    while(day.isBefore(tenYears)) {
        ferengi = getPlanetPosition(FERENGI_DISTANCE, ferengi.degree + 1);
        betasoide = getPlanetPosition(BETASOIDE_DISTANCE, betasoide.degree + 3);
        vulcano = getPlanetPosition(VULCANO_DISTANCE, vulcano.degree + 5);
        rainIntensity = 0;

        if(arePlanetsAlignedWithSun(ferengi, betasoide, vulcano)) {
            weather = WEATHER_DRY;
        }else if(arePlanetsAligned(ferengi, betasoide, vulcano)) {
            weather = WEATHER_PERFECT;
        }else if(isSunInsidePlanets(ferengi, betasoide, vulcano)) {
            weather = WEATHER_RAINY;
            rainIntensity = getDistance(ferengi, betasoide) + getDistance(betasoide, vulcano) + getDistance(vulcano, ferengi);
        }else {
            weather = WEATHER_HUMID;
        }
        toSave.push(new WeatherModel({
            day: day.toISOString(),
            weather,
            rainIntensity,
            ferengiPosition: [ferengi.x, ferengi.y],
            ferengiDegree: ferengi.degree,
            betasoidePosition: [betasoide.x, betasoide.y],
            betasoideDegree: betasoide.degree,
            vulcanoPosition: [vulcano.x, vulcano.y],
            vulcanoDegree: vulcano.degree
        }));
        if(toSave.length === 365) {
            console.log(`Saving ${toSave.length} docs...`);
            try {
                const result = await WeatherModel.insertMany(toSave);
                console.log(`${toSave.length} docs saved`);
            }catch(error) {
                console.error(error.message);
            }
            toSave = [];
        }
        day.add(1, 'days');
    }
    if(toSave.length > 0) {
        console.log(`Saving ${toSave.length} docs...`);
        try {
            const docs = await WeatherModel.insertMany(toSave);
            console.log(`${toSave.length} docs saved`);
        }catch(error) {
            console.error(error.message);
        }
    }
};

export {initializeDataBase};