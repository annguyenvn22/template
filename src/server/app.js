/*jshint node:true*/
'use strict';

var cors         = require('cors');
var logger       = require('morgan');
var express      = require('express');
var bodyParser   = require('body-parser');
var compress     = require('compression');
var favicon      = require('serve-favicon');
var errorHandler = require('./routes/utils/errorHandler')();

var app          = express();
var port         = process.env.PORT || 7203;
var environment  = process.env.NODE_ENV || 'dev';


app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(compress());
app.use(logger('dev'));
app.use(cors());
app.use(errorHandler.init);

switch (environment) {
    case 'build':
        app.use(express.static('./build/'));
        app.use('/*', express.static('./build/index.html'));
        break;
    default:
        app.use(express.static('./src/client/'));
        app.use(express.static('./'));
        app.use(express.static('./src/client/fonts/'));
        app.use('/*', express.static('./src/client/index.html'));
        break;
}

app.listen(port);
