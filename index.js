const express = require('express');
const morgan = require('morgan');
const reload = require('./reload-express');

const PORT = 5500;
const app = express();

app.use(morgan('dev'));

// args: app and url for EventSource
reload(app, '/reload');

app.use(express.static('public'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
