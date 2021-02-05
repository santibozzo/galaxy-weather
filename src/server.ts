const PORT = 8080;
const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_NAME = 'galaxy';
// const weatherRouter = require('./src/routers/weatherRouter');
const cors = require('cors');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dataBaseInitializer = require('./dataAccess/dataBaseInitializer');

app.use(express.json());
app.use(cors());
// app.use('/weather', weatherRouter);

app.listen(PORT, () => console.log(`Server started... listening on port ${PORT}`));


const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, connectionOptions)
    .then(() => {
        console.log('Connected to DB');
        dataBaseInitializer.initializeDataBase();
    })
    .catch(error => console.error(error));
