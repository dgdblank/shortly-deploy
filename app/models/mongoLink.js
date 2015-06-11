var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var encrypt = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

var linkSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0}
});

linkSchema.pre('save', function(next) {
  this.code = encrypt(this.url);
  next();
});

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;
