
var wspoint = require('../wspoint.js');
var test = require('tap').test;
var http = require('http');
var endpoint = require('endpoint');
var engine = require('engine.io');
var WebSocket = require('engine.io-client');

var server = http.createServer();
var wss, address;

test('start server', function (t) {
  server.listen(0, 'localhost', function () {
    address = 'ws://localhost:' + server.address().port;
    wss = engine.attach(server);
    t.end();
  });
});

test('client send buffer', function (t) {
  wss.once('connection', function(ws) {
    wspoint(ws)
      .pipe(endpoint(function (err, buffer) {
        t.equal(err, null);
        t.ok(Buffer.isBuffer(buffer));
        t.equal(buffer.toString(), 'client send');
        t.end();
      }));
  });

  wspoint(new WebSocket(address))
    .end('client send');
});

test('server send buffer', function (t) {
  wss.once('connection', function(ws) {
    wspoint(ws)
      .end('server send');
  });

  wspoint(new WebSocket(address))
    .pipe(endpoint(function (err, buffer) {
      t.equal(err, null);
      t.ok(Buffer.isBuffer(buffer));
      t.equal(buffer.toString(), 'server send');
      t.end();
    }));
});

test('client send buffer', function (t) {
  wss.once('connection', function(ws) {
    wspoint(ws, {objectMode: true})
      .pipe(endpoint({objectMode: true}, function (err, rows) {
        t.equal(err, null);
        t.ok(Array.isArray(rows));
        t.deepEqual(rows, [{msg: 'client send'}]);
        t.end();
      }));
  });

  wspoint(new WebSocket(address), {objectMode: true})
    .end({msg: 'client send'});
});

test('server send object', function (t) {
  wss.once('connection', function(ws) {
    wspoint(ws, {objectMode: true})
      .end({msg: 'server send'});
  });

  wspoint(new WebSocket(address), {objectMode: true})
    .pipe(endpoint({objectMode: true}, function (err, rows) {
      t.equal(err, null);
      t.ok(Array.isArray(rows));
      t.deepEqual(rows, [{msg: 'server send'}]);
      t.end();
    }));
});

test('close server', function (t) {
  wss.close();
  server.close(function () {
    t.end();
  });
});
