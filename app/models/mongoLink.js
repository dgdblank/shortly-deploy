var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number
})

var Link = mongoose.model('Link', linkSchema);

module.exports.Link = Link;
