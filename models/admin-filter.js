const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var viewStudentsSchema = new Schema({
  key: String,
  viewStudents: String
});

var viewStudentAdmin = mongoose.model('filter_student_db', viewStudentsSchema);
module.exports = viewStudentAdmin;
