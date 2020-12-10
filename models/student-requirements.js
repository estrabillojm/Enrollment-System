const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var requirementSchema = new Schema({
  lrn: String,
  fullname: String,
  requirements: String

});


var tblRequirements = mongoose.model('student_requirement_db', requirementSchema);

module.exports = tblRequirements;
