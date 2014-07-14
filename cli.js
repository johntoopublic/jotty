#!/usr/bin/env node
var jotty = require('./index.js');
var opts = require('nomnom').script('jotty').options({
  authlink: {
    abbr: 'a',
    flag: true,
    help: 'Whether to use limit shell access by requiring a generated passphrase.',
  },
  command: {
    abbr: 'c',
    metavar: 'COMMAND',
    help: 'Run COMMAND when opening shell.',
  },
  port: {
    abbr: 'p',
    metavar: 'PORT',
    help: 'Listen on PORT.',
  },
}).parse();

jotty({command: opts.command}).listen(opts.port);

if (opts.authlink) {
  jotty.authlink();
}
