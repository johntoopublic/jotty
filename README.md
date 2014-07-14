jotty
=====

An in browser terminal based on tty.js with support for drag and drop upload.

    npm install jotty
     ~ jotty -h
     
    Usage: jotty [options]
    
    Options:                                                                   
       -a, --authlink                  Whether to use authlink as auth.
       -c COMMAND, --command COMMAND   Whether to use authlink as auth.
       -p PORT, --port PORT            The port to listen on.
       
     ~ node cli.js
    Listening on 8080
     
     ~ node cli.js -p 8000 -a -c 'screen -drU'
    Listening on 8000
    http://localhost/jotty/sign?xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    
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
