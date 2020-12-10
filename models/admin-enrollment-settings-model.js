const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var enrollmentSettingsSchema = new Schema({
 enrollmentStatus: String,
 maxEntries: String,
 maxStudent: String,
 academicFirst: String,
 academicEnds: String,
 semester: String
});

var enrollmentSettings = mongoose.model('enrollment_settings_db', enrollmentSettingsSchema);

module.exports = enrollmentSettings;
