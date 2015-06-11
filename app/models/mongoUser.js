var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
  username: String,
  password: {type: String, required: true, bcrypt: true}
});

// bcrypts the password upon initialization
userSchema.plugin(require('mongoose-bcrypt'));

var User = mongoose.model('User', userSchema);
module.exports.User = User;
