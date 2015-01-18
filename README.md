bufferedObjectStream
====================

Usage:

var BufferTransformStream = require('bufferObjectStream').BufferTransformStream;

var bufferStream = new BufferTransformStream({commitSize: 1000, commitDelay: 500});

...

anyObjectStream     // Object stream -> {},{} ... {}
.pipe(bufferStream)
.pipe(targetStream);  // Target object stream [{},{}, ... {}], [{},{}, ... {}], ...
                      // where size of array <= commitSize (1000 at this example)
                      // and flushed to targetStream when commitDelay is over (500 at this example)