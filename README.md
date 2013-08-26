#wspoint

> Create a dublex stream around a websocket

## Installation

```sheel
npm install wspoint
```

## Support

This is a very minimal implementation it don't wrap `ping`, `pong` events
or support any real backpresure. However beacuse of this minimal implementation
it works in both browser and in node with the following APIs:

* Supports W3C WebSocket
* [ws](https://github.com/einaros/ws)
* [engine.io](https://github.com/LearnBoost/engine.io

## Documentation

```javascript
var wspoint = require('wspoint');
var assert = require('assert');
var WebSocket = require('ws');

// Buffer stream
var socket = wspoint(new WebSocket('ws://localhost:8000'));
process.stdin.pipe(socket).pipe(process.stdout);

// Object stream
var socket = wspoint(new WebSocket('ws://localhost:8000'), {objectMode: true});
socket.write({ event: 'connected' });
socket.once('readable', function () {
  assert.deepEqual(socket.read(), { cmd: 'rock it' });
});
```

##License

**The software is license under "MIT"**

> Copyright (c) 2013 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
