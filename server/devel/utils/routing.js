import express from 'express';
import clioutput from './clioutput';
var path = require('path');
var fs = require("fs");

const routing = express.Router();

routing.get('/debug', (req, res) => {
  // No logging framework used. Choose your own, e.g. Winston
  clioutput.info(JSON.stringify(req.body));
  res.status(200).send({ message: 'OK'});
});
routing.get('/v1/*', (req, res) => {
  clioutput.ok('[200] ' + req.params[0]);

  res.sendFile(path.join(__dirname, '/../../../src/api/', req.params[0] ? req.params[0] : 'status.json'));
  res.status(200);
});

routing.get('/coverage/*', (req, res) => {
  clioutput.ok('[200] ' + req.params[0]);
  res.sendFile(path.join(__dirname, '/../../coverage/', req.params[0] ? req.params[0] : 'index.html'));
  res.status(200);
});


//TODO the router probably should not serve static assets
//probably it's best to use the "copy webpack-addon thingy" or check out other options to provide access to certain node_modules
//note this only serves /api/* in our use case atm
routing.get('*', (req, res) => {



    //TODO only forward files from dist folder and check if express.static interferes in any way with this code

  //FIXME change again for production
  //clioutput.error('[404] Not Found ... ' + req.params[0]);
  //res.sendStatus(404).end()

   // var mPath=path.join(__dirname, '../../', req.params[0] ? req.params[0] : 'index.html')
    var mPath=path.join(__dirname, '../../', req.params[0])

    console.log('routing *',mPath);
    fs.stat(mPath, function(err, stat) {
        if(err == null) {

            clioutput.ok('[200] ' + req.params[0]);
            res.sendFile(mPath);
            res.status(200);

        } else if(err.code == 'ENOENT') {
            //res.status(404);

            clioutput.error('[404] Not Found ' + req.params[0]);
            res.sendStatus(404).end()


        } else {
            console.log('error with file: ', err.code);
            clioutput.error('[404] Not Found ' + req.params[0]);
            res.sendStatus(404).end()
        }
    });


});

export default routing;
