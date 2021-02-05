import mongoose, { Schema, Document } from 'mongoose';

export interface IWeatherModel extends Document {
    day: string,
    weather: string,
    rainIntensity: number,
    ferengiPosition: number[],
    ferengiDegree: number,
    betasoidePosition: number[],
    betasoideDegree: number,
    vulcanoPosition: number[],
    vulcanoDegree: number
}

const WeatherSchema: Schema = new Schema({
    day: {type: String, required: true, unique: true},
    weather: {type: String, required: true},
    rainIntensity: {type: Number, required: true},
    ferengiPosition: {type: [Number], required: true},
    ferengiDegree: {type: Number, required: true},
    betasoidePosition: {type: [Number], required: true},
    betasoideDegree: {type: Number, required: true},
    vulcanoPosition: {type: [Number], required: true},
    vulcanoDegree: {type: Number, required: true}
});

export default mongoose.model<IWeatherModel>('Weather', WeatherSchema);