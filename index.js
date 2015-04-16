/**
 * Created by novoden on 18/01/15.
 */

var util = require('util');
var Transform = require('stream').Transform;

util.inherits(BufferTransform, Transform);
util.inherits(NullStream, Transform);

module.exports.NullStream = NullStream;
module.exports.BufferTransformStream = BufferTransform;

/* Buffered transform stream */

function BufferTransform(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof BufferTransform))
    return new BufferTransform(options);
  this._commitDelay = options.commitDelay || 100;
  this._commitSize = options.commitSize || 200;

  this._timeOver = false;
  this._queue = [];
  this.lock = null;

  Transform.call(this, options);
}

BufferTransform.prototype._resetSchedule = function() {
  clearTimeout(this.lock);
  this._timeOver = false;
  this.lock = null;
};

BufferTransform.prototype.schedule = function(reset) {
  var self = this;
  if (reset) {
    this._resetSchedule();
  }
  if (!this.lock) {
    this.lock = setTimeout(function() {
      self._timeOver = true;
    },this._commitDelay);
  }
};

BufferTransform.prototype._transform = function(obj, encoding, done) {
  var queue = this._queue;
  queue.push(obj);
  this.schedule();
  if (queue >= this._commitSize || this._timeOver) {
    this.push(queue.splice(0,queue.length));
    this.schedule(true);
  }
  done();

};

BufferTransform.prototype._flush = function(done) {
  var queue = this._queue;
  this.push(queue.splice(0,queue.length));
  this._resetSchedule();
  done();
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