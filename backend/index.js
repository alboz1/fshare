require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const requestListener = require('./lib/requestListener');

const port = process.env.PORT || 4444;

//connect to database
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('connected to database'))
    .catch(error => console.log(error))

const app = http.createServer(requestListener);

app.listen(port, () => console.log(`Listening to port ${port}`));