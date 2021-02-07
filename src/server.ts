import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import weatherRouter from './routers/weatherRouter';
import { initializeDataBase } from './dataAccess/dataBaseInitializer';

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());
app.use('/weathers', weatherRouter);

app.listen(process.env.SERVER_PORT, () => console.log(`Server started... listening on port ${process.env.SERVER_PORT}`));


const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, connectionOptions)
    .then(() => {
        console.log('Connected to DB');
        initializeDataBase();
    })
    .catch(error => console.error(error));
