#!/usr/bin/env node
var jotty = require('./index.js');
var opts = require('nomnom').script('jotty').options({
  authlink: {
    abbr: 'a',
    flag: true,
    help: 'Whether to use authlink as auth.',
  },
  command: {
    abbr: 'c',
    metavar: 'COMMAND',
    help: 'Whether to use authlink as auth.',
  },
  port: {
    abbr: 'p',
    metavar: 'PORT',
    help: 'The port to listen on.',
  },
}).parse();

jotty({command: opts.command}).listen(opts.port);

if (opts.authlink) {
  jotty.authlink();
}
