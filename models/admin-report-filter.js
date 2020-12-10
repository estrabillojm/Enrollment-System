const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var reportFilterSchema = new Schema({
  user: String,
  strands: String,
  section: String

});


var reportFilterAdmin = mongoose.model('report_filter_db', reportFilterSchema);

module.exports = reportFilterAdmin;
