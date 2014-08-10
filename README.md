jotty [![npm version](http://img.shields.io/npm/v/jotty.svg)](https://npmjs.org/package/jotty) [![npm downloads](http://img.shields.io/npm/dm/jotty.svg)](https://npmjs.org/package/jotty) [![npm downloads](http://img.shields.io/npm/l/jotty.svg)](http://unlicense.org)
=====

Jotty allows quick access to a server terminal inside of your browser, and is designed to be easily embedded inside other applications or management pages. It uses [socket.io](http://socket.io/), and is based on [tty.js](https://github.com/chjj/tty.js/) with optional support for drag and drop upload.

    npm install jotty
     ~ jotty -h
     
    Usage: jotty [options]

    Options:
       -a, --authlink                  Whether to use limit shell access by requiring a generated passphrase.
       -c COMMAND, --command COMMAND   Run COMMAND when opening shell.
       -p PORT, --port PORT            Listen on PORT.
       
     ~ jotty # or node cli.js
    Listening on 8080
     
     ~ jotty -p 8000 -a -c 'screen -drU'
    Listening on 8000
    http://localhost:8000/jotty/sign?key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    
[Settings](/index.js#L14) can be also overridden by requiring the module and using it directly:

    var jotty = require('jotty');
    jotty({secret: 'This sets a new secret key.'}).listen();

Can also be used around [express](http://expressjs.com/):

    var express = require('express');
    var jotty = require('jotty');
    var app = express()
    app.use(jotty.router());;
    // ...
    var server = require('http').createServer(app).listen(process.env.PORT);
    jotty.io(server);
