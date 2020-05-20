const express = require('express');
const morgan = require('morgan');

const app = express();

/** middlewares */
app.use(morgan('dev'));
app.use(express.json());

const api = require('./api');
app.use('/api/v1', api);

app.use(express.static('static'));

/** endpoints */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/:workspaceUUID', (req, res) => {
    res.sendFile(__dirname + '/views/workspace.html');
});

app.get('/notfound/:workspaceUUID', (req, res) => {
    res.sendFile(__dirname + '/views/workspaceNotFound.html');
});

app.get('/workspaces/new', (req, res) => {
    res.sendFile(__dirname + '/views/newWorkspace.html');
})

/** error handeler */
function errorHandeler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        message: err.message,
        stack: err.stack,
        err: true
    });
}

/** 404 not found */
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
}

/** start server */
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.use(notFound);
app.use(errorHandeler);