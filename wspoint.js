
var util = require('util');
var timers = require('timers');
var stream = require('stream');

function WebSocketPoint(socket, options) {
  if (!(this instanceof WebSocketPoint)) return new WebSocketPoint(socket, options);
  stream.Duplex.call(this, options);
  var self = this;

  this._objectMode = !!(options && options.objectMode);
  this._socket = socket;
  this._openFlag = false;
  this._buffer = [];

  this._socketClosed = false;
  this._endCalled = false;
  this._noData = false;

  // Relay standard event
  this._onSocket('error', this.emit.bind(this, 'error'));

  // Relay singelton events
  if (this.readyState === 1) {
    timers.setImmediate(function () {
      self._open();
    });
  } else {
    this._onSocket('open', function open() {
      self._offSocket('open', open);
      self._open();
    });
  }

  // No more data can be written or read
  this._onSocket('close', function close() {
    self._offSocket('close', close);
    self._socketClosed = true;
    self._close();

    // Close stream and emit close
    self.emit('close');
  });

  // Data rescived push to stream and pause stream if no more data should be
  // pushed
  this._onSocket('message', function (data) {
    data = self._decode(data);
    if (data === undefined) return;
    self.push(data);
  });

  // .end was called make sure that the buffer was drained
  this.once('finish', function () {
    self._endCalled = true;
    if (self._buffer.length === 0) return self._close();

    self.once('open', function () {
      self._close();
    });
  });
}
module.exports = WebSocketPoint;
util.inherits(WebSocketPoint, stream.Duplex);

// Handle open by draining the buffer
WebSocketPoint.prototype._open = function () {
  // Set open flag, so no more will be pushed to the buffer array
  this._openFlag = true;

  // Send and and clear the buffer
  for (var i = 0, l = this._buffer.length; i < l; i++) {
    this._socket.send(this._buffer[i]);
  }
  this._buffer = [];

  // Emit open
  this.emit('open');
};

// Close what can be closed
WebSocketPoint.prototype._close = function () {
  if (this._endCalled === false) {
    this._endCalled = true;
    this.end();
  }
  if (this._socketClosed === false) {
    this._socketClosed = true;
    this._socket.close();
  }
  if (this._noData === false) {
    this._noData = true;
    this.push(null);
  }
};

// Add websocket event
WebSocketPoint.prototype._onSocket = function (eventName, eventHandle) {
  if (this._socket.on) {
    this._socket.on(eventName, eventHandle);
  } else {
    this._socket.addEventListener(eventName, eventHandle);
  }
};

// Remove websocket event
WebSocketPoint.prototype._offSocket = function (eventName, eventHandle) {
  if (this._socket.on) {
    this._socket.removeListener(eventName, eventHandle);
  } else {
    this._socket.removeEventListener(eventName, eventHandle);
  }
};

// Parse data string
WebSocketPoint.prototype._decode = function (data) {
  if (this._objectMode) {
    try {
      return JSON.parse(data);
    } catch (e) {
      this.emit('error', e);
      return;
    }
  } else {
    return data;
  }
};

// Stringify data object
WebSocketPoint.prototype._encode = function (data) {
  if (this._objectMode) {
    try {
      return JSON.stringify(data);
    } catch (e) {
      this.emit('error', e);
      return;
    }
  } else {
    return data.toString();
  }
};

WebSocketPoint.prototype._read = function () {
  // Implemented by push
};

WebSocketPoint.prototype._write = function (data, encodeing, done) {
  data = this._encode(data);
  if (data === undefined) return;

  // Buffer data if the websocket isn't ready
  if (this._openFlag) {
    this._socket.send(data);
  } else {
    this._buffer.push(data);
  }

  done(null);
};

// Relay close and terminate methods
WebSocketPoint.prototype.close = function () {
  this._socket.close.apply(this._socket, arguments);
};

// Relay calls to get:readyState
var READY_STATES = ['opening', 'open', 'closing', 'closed'];
Object.defineProperty(WebSocketPoint.prototype, 'readyState', {
  get: function get() {
    var readyState = this._socket.readyState;

    // engine.io returns a string convert it to a W3C standard number:
    //  http://www.w3.org/TR/websockets/#dom-websocket-readystate
    if (typeof readyState === 'string') {
      readyState = READY_STATES.indexOf(readyState);
    }

    return readyState;
  }
});
