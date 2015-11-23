/**
 * Created by novoden on 18/01/15.
 */

var util = require('util');
var Transform = require('stream').Transform;

util.inherits(BufferTransform, Transform);
util.inherits(NullStream, Transform);
util.inherits(FlattenTransform, Transform);

module.exports = {
  NullStream: NullStream,
  FlattenTransformStream: FlattenTransform,
  BufferTransformStream: BufferTransform
};

/* Buffered transform stream */

function BufferTransform(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof BufferTransform))
    return new BufferTransform(options);
  this._commitDelay = options.commitDelay || 100;
  this._commitSize = options.commitSize || 200;

  //this._timeOver = false;
  this._queue = [];
  this.lock = null;

  Transform.call(this, options);
}

BufferTransform.prototype._resetSchedule = function() {
  clearTimeout(this.lock);
  //this._timeOver = false;
  this.lock = null;
};

BufferTransform.prototype.schedule = function(reset) {
  var self = this;
  if (reset) {
    this._resetSchedule();
  }
  if (!this.lock) {
    this.lock = setTimeout(function() {
      //self._timeOver = true;
      self._flush();
    },this._commitDelay);
  }
};

BufferTransform.prototype._transform = function(obj, encoding, done) {
  var queue = this._queue;
  queue[queue.length] = obj;
  this.schedule();
  if (queue.length >= this._commitSize) { // || this._timeOver
    this.push(queue.splice(0,queue.length));
    this.schedule(true);
  }
  done();

};

BufferTransform.prototype._flush = function(done) {
  var queue = this._queue;
  if (queue.length) {
    this.push(queue.splice(0, queue.length));
  }
  this._resetSchedule();
  if (done) done();
};


/* Null stream */

function NullStream(options) {
  if (!(this instanceof NullStream))
    return new NullStream(options);

  Transform.call(this, options);
}

NullStream.prototype._transform = function(chunk, encoding, cb) {
  cb();
};


/* Flat transform stream */

function FlattenTransform(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof FlattenTransform))
    return new FlattenTransform(options);

  Transform.call(this, options);
}

FlattenTransform.prototype._transform = function(obj, encoding, done) {
  if (Array.isArray(obj)) {
    for (var i = 0, len = obj.length; i < len; i++) {
      this.push(obj[i]);
    }
  } else {
    this.push(obj);
  }
  done();
};
