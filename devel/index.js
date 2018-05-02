import 'babel-polyfill';
import webpack from 'webpack';
import config from '../config/webpack.config.babel';
import express from 'express';
import path from 'path';
import history from 'connect-history-api-fallback';
import bodyParser from 'body-parser';
import routing from './utils/routing';
import helper from './utils/helpers';
import clioutput from './utils/clioutput';


import http from "http";
import easyrtc from "easyrtc";
import socketIo from "socket.io";


//import  serveIndex from 'serve-index';

const argv = helper.parseArguments(process.argv.slice(2));
const isHot = argv['hot'] || false;
const publicPath = config.output.publicPath || '/';
const outputPath = config.output.path || path.resolve(process.cwd(), 'dist');
const host = '0.0.0.0';
const port = process.env.PORT || argv.port || 9000;
const app = express();


if(isHot) {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: publicPath,
    contentBase: config.context,
    stats: 'errors-only',
    hot: true,
    inline: true,
    lazy: false,
    historyApiFallback: true,
    headers: {'Access-Control-Allow-Origin': '*'},
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/webpack-hot-module-replace',
    heartbeat: 10 * 1000,
  }));
}
else {
  const compression = require('compression');
  app.use(compression());

    //TODO evaluate how to start using static to reduce memory consumption
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const compiler = webpack(config);

    app.use(webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: publicPath,
        contentBase: config.context,
        stats: 'errors-only',
        hot: false,
        inline: true,
        lazy: false,
        historyApiFallback: true,
        headers: {'Access-Control-Allow-Origin': '*'},
    }));




}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//-----------------------------------------

//TODO partially working: prevents loading half way
//have a 401 for when the user did the sketchfab login and pressed cancel
app.use(publicPath,function(req, res,next) {

    var query = require('url').parse(req.headers.referer,true).query;

    if (query.error=="access_denied")
    res.status(401).send('401 Unauthorized');
    else next()


});



//-----------------------------------------

console.log("--------------------------")
console.log("publicPath:",publicPath)
console.log("outputPath:",outputPath)
/* serving static assets*/
app.use(publicPath, express.static(outputPath,{index:false,redirect:false,setHeaders: function (res, path, stat) {
   // res.set('Content-Type', "text/html")

}}));

//TODO check for interference if api folder exists
app.use('/api', routing);
app.use(history({
  verbose: false,
}));

//have a 404 response
app.use(function(req, res) {

       res.status(404).send('404: Page not Found');

});

// Handle 500
app.use(function(error, req, res, next) {
    res.status(500).send('500: Internal Server Error');
});


/*********************************************/
//a-frame-network

// Start Express http server
var webServer = http.createServer(app).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});


var myIceServers = [
    {"url":"stun:stun.l.google.com:19302"},
    {"url":"stun:stun1.l.google.com:19302"},
    {"url":"stun:stun2.l.google.com:19302"},
    {"url":"stun:stun3.l.google.com:19302"}
    // {
    //   "url":"turn:[ADDRESS]:[PORT]",
    //   "username":"[USERNAME]",
    //   "credential":"[CREDENTIAL]"
    // },
    // {
    //   "url":"turn:[ADDRESS]:[PORT][?transport=tcp]",
    //   "username":"[USERNAME]",
    //   "credential":"[CREDENTIAL]"
    // }
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);



// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

/*********************************************/



process.on('uncaughtException', err => {
  clioutput.error('Uncaught Exception ', err.stack);
  process.exit(1)
});

/*
app.listen(port, host, (err) => {
  if(err) {
    clioutput.error(err.message);
  }
  else {
    clioutput.banner(port);
  }
});
*/
//listen on port
webServer.listen(port, function () {
    console.log('listening on http://localhost:' + port);
});
