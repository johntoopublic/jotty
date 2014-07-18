#!/usr/bin/env node
var fs = require('fs');
var http = require('http');
var os = require('os');
var path = require('path');
var url = require('url');

var authlink = require('authlink');
var io = require('socket.io');
var multiparty = require('multiparty');
var term = require('term.js');
var pty = require('pty.js');

var settings = {
  auth: function(req, next) {next()},
  basepath: '/jotty/',
  sign: null,
  cwd: process.env.HOME,
  command: '',
  font: '13px monospace',
  ioname: '/jotty',
  port: process.env.PORT || 8080,
  secret: 'This value is used as an hmac key, and should be set',
  tmp: os.tmpDir(),
  upload: true,
};

module.exports = function(env) {
  for (var k in env) {
    settings[k] = env[k];
  }
  return module.exports;
};

module.exports.renameFile = function(current, original) {
  for (var i = 0; i < 10; i++) {
    var name = path.join(settings.tmp, original + (i ? '-' + i : ''));
    if (!fs.existsSync(name)) {
      fs.renameSync(current, name);
      console.log('Uploaded ' + name);
      return;
    }
  }
  console.log('Uploaded ' + original + ' as ' + current);
};

module.exports.router = function() {
  var paths = {};
  if (settings.upload) {
    paths[settings.basepath + 'upload'] = null;
  }
  if (settings.sign) {
    paths[settings.basepath + 'sign'] = null;
  }
  paths[settings.basepath + 'term.js'] = term.script;
  paths[settings.basepath] = fs.readFileSync(
      path.join(__dirname, 'index.html')).toString().replace(
      /{{(.+?)}}/g, function(match, keyword) {
    return settings[keyword] || '';
  });
  return function (req, res, next) {
    req.parse = url.parse(req.url);
    if (req.parse.pathname === settings.basepath + 'sign' && settings.sign) {
      settings.sign(req, res);
    } else if (req.parse.pathname in paths) {
      settings.auth(req, function(e) {
        if (e) {
          res.writeHead(403)
          res.end('403');
        } else if (paths[req.parse.pathname]) {
          res.writeHead(200)
          res.end(paths[req.parse.pathname]);
        } else if (req.parse.pathname === settings.basepath + 'upload') {
          var form = new multiparty.Form({uploadDir: settings.tmp});
          form.parse(req, function(err, fields, files) {
            if (files.file) {
              files.file.forEach(function(file) {
                module.exports.renameFile(file.path, file.originalFilename);
              });
            }
            res.writeHead(204)
            res.end();
          });
        }
      });
    } else if (next) {
      next();
    }  else if (req.parse.pathname === '/') {
      res.writeHead(302, {location: settings.basepath})
      res.end();
    } else {
      res.writeHead(404)
      res.end('404');
    }
  };
};

module.exports.onConnection = function(socket) {
  socket.on('create', function(cols, rows) {
    var args = settings.command ? ['-c', settings.command] : [];
    var fork = pty.fork('bash', args, {
      cols: cols,
      rows: rows,
      cwd: settings.cwd,
    });
    socket.on('data', function(data) {
      fork.write(data);
    });
    socket.on('resize', function(cols, rows) {
      fork.resize(cols, rows);
    });
    socket.on('disconnect', function() {
      fork.destroy();
    });
    fork.on('data', function(data) {
      socket.emit('data', data);
    });
    fork.on('close', function(data) {
      socket.disconnect();
    });
  });
};

module.exports.io = function(app) {
  var socket = io(app).of(settings.ioname);
  socket.use(function(socket, next) {
    settings.auth(socket.request, next);
  });
  socket.on('connection', module.exports.onConnection);
}

module.exports.listen = function(port) {
  if (port) {
    settings.port = port;
  }
  var app = http.createServer(module.exports.router());
  module.exports.io(app);
  app.listen(settings.port);
  console.log('Listening on ' + settings.port);
  return module.exports;
};

module.exports.authlink = function() {
  settings.auth = authlink.auth;
  settings.sign = authlink.sign;
  var pair = authlink.generate();
  var link = 'http://' + os.hostname();
  if (settings.port != 80) {
    link += ':' + settings.port;
  }
  link += settings.basepath + 'sign?' + pair.key;
  console.log(link);
  return module.exports;
};

if (require.main === module) {
  module.exports.listen();
}
