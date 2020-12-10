const router = require('express').Router();
const userAdmin = require('../models/admin-user-model');
const logAdmin = require('../models/admin-log-model.js');
const subjectAdmin = require('../models/admin-subject-model.js');
const schedAdmin = require('../models/admin-schedule-model.js');
const tracksAdmin = require('../models/admin-enrollment-tracks-model.js');
const strandsAdmin = require('../models/admin-enrollment-strands-model.js');
const sectionAdmin = require('../models/admin-enrollment-section-model.js');
const tblAdmin = require('../models/admin-tbl-view-model.js');
const teacherAdmin = require('../models/admin-teacher-schedule-model.js');
const studentPending = require('../models/new-student-pending-model.js');
const enrollStudent = require('../models/student-enroll-model.js');
const filterStudent = require('../models/admin-filter.js');
const tblRequirements = require('../models/student-requirements.js');
const reportFilter = require('../models/admin-report-filter.js');

const keys = require('../config/keys');
const enrollmentSettings = require('../models/admin-enrollment-settings-model.js');
var crypto = require('crypto');
var assert = require('assert');
var hold = "";

var option = "";


router.get('/admin',(req, res)=>{
  if (req.session.username && req.session.password){
    studentPending.find({}, (err, user)=>{
      hold="admin";
      console.log(user.length);
      res.render('admin/admin',{hold: hold, student: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
    });

  }else{
    res.redirect('login-form')
  }
});


router.get('/students',(req, res)=>{

    if (req.session.username && req.session.password){

      filterStudent.find({}, (err, user2)=>{
        console.log(user2[0].academicFirst);
        if(user2[0].viewStudents === 'all'){
          enrollStudent.find({}, (err, user)=>{
            hold="students";
            res.render('admin/admin',{hold: hold, filter: user2, student: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
          });
        }else{
          enrollmentSettings.find({},(err, user3)=>{
            enrollStudent.find({hiddenEnrollYear: user3[0].academicFirst, hiddenEnrollSem: user3[0].semester}, (err, user)=>{
              hold="students";
              res.render('admin/admin',{hold: hold, settings: user3, filter: user2, student: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
            });
          });
        }
      });
    }else{
      res.redirect('login-form')
    }
});

router.get('/teachers',(req, res)=>{
  if (req.session.username && req.session.password){
    userAdmin.find({teachingStatus: 'teaching'}, (err, user)=>{
      teacherAdmin.find({},(err, user2)=>{
        hold="teachers";
        res.render('admin/admin',{hold: hold, teacher: user, user2: user2, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      }).sort({day:1, timeIn:1})

    })
  }else{
    res.redirect('login-form')
  }
});

router.get('/enrolment',(req, res)=>{

  if (req.session.username && req.session.password){

    tracksAdmin.find({},(err, user)=>{
      strandsAdmin.find({},(err, user2)=>{
        sectionAdmin.find({},(err, user3)=>{
          tblAdmin.find({idNumber: req.session.username},(err, user4)=>{
            hold="enrolment";
            res.render('admin/admin',{hold: hold, tracks: user, strands: user2, section: user3, viewStatus: user4, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
          });
        }).sort({strand:1, section: 1});
      }).sort({strands:1});
    }).sort({tracks:1});;
  }else{
    res.redirect('login-form')
  }
});

router.get('/subjects',(req, res)=>{
  if (req.session.username && req.session.password){
    subjectAdmin.find({typeOfCurriculum: 'new'},(err, user)=>{
      tblAdmin.find({idNumber: req.session.username},(err, user2)=>{
        subjectAdmin.find({typeOfCurriculum: 'old'},(err, user3)=>{

          hold="subjects";
          res.render('admin/admin',{hold: hold, user:user, curriculum:user2, user3: user3, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      });
    }).sort({courseTitle:1});
  }else{
    res.redirect('/administrator/login-form')
  }
});

router.get('/schedules',(req, res)=>{
  var strandNum;

  if (req.session.username && req.session.password){

  schedAdmin.distinct('strand' ,(err, user)=>{
      strandNum = user.length;
        schedAdmin.find({strand: user},(err, user2)=>{
          hold="schedules";
          res.render('admin/admin',{hold: hold, strand: user, user: user2, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      }).sort({day:1, timeIn:1});
    });

  }else{
    res.redirect('login-form')
  }
});


router.get('/users',(req, res)=>{

  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      userAdmin.find({},(err, user)=>{
        tblAdmin.find({idNumber: req.session.username},(err, user2)=>{
          hold="users";
          res.render('admin/admin',{hold: hold, user: user, viewStatus: user2, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      }).sort({firstname:1});
    }else{
      res.redirect('/administrator/page-not-found');
    }


  }else
  {
    res.redirect('login-form')
  }

});

router.get('/settings',(req, res)=>{
  if (req.session.username && req.session.password){
    userAdmin.find({idNumber: req.session.username}, (err, user)=>{
      hold="settings";
      option="settings-security";

      var algorithm = 'aes256';
      var key = keys.cipherKey.key;
      var text = req.body.password;

      var decipher = crypto.createDecipher(algorithm, key);
      var decrypted = decipher.update(req.session.password, 'hex', 'utf8') + decipher.final('utf8');


      res.render('admin/admin',{hold: hold, user: user, option: option, userType: req.session.userType, teachingStatus: req.session.teachingStatus, oldPassword: req.session.password, passwordAuth: decrypted});
    });
  }else{
    res.redirect('login-form')
  }
});


router.get('/my-schedule',(req, res)=>{
  if (req.session.username && req.session.password){
    userAdmin.find({idNumber: req.session.username}, (err, user)=>{
      teacherAdmin.find({teacher: req.session.username}, (err, user2)=>{
        hold="mySchedule";
        option="my-schedule";
        res.render('admin/admin',{hold: hold, user: user, option: option, userType: req.session.userType, teacher: user2, teachingStatus: req.session.teachingStatus});
      }).sort({day: 1});
    });
  }else{
    res.redirect('login-form')
  }
});


router.get('/reports',(req, res)=>{
  if (req.session.username && req.session.password){
    hold="reports";
    enrollmentSettings.find({_id:'5d5eac152b3cd10e8c764ef0'}, (err, user5)=>{

      var academicYear = user5[0].academicFirst;
      var semester = user5[0].semester;


      reportFilter.find({user: req.session.username}, (err, user4)=>{
        enrollStudent.find({strand: user4[0].strands , section: user4[0].section,
        hiddenEnrollSem: user5[0].semester, hiddenEnrollYear:user5[0].academicFirst}, (err, user)=>{
          strandsAdmin.find({}, (err, user2)=>{
            sectionAdmin.find({strand: user4[0].strands}, (err, user3)=>{
              console.log(user.length);
              res.render('admin/admin',{
                hold: hold,
                userType: req.session.userType,
                teachingStatus: req.session.teachingStatus,
                student: user,
                strand: user2,
                report: user4,
                section: user3,
                maxStudent: user5
              });
            })
          });
        })
      });
    });
  }else{
    res.redirect('login-form')
  }
});

router.get('/logs',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      logAdmin.find({}, (err, user)=>{
        hold="logs";
        res.render('admin/admin',{hold: hold, user: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      }).sort({date:-1,timeIn:-1});
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('login-form')
  }
});


router.get('/login-form',(req, res)=>{
  if (req.session.username && req.session.password){
    logAdmin.find({}, (err, user)=>{
      hold="admin";
      res.redirect('/administrator/admin');
    })
  }else{
    res.render('admin/login-form',{
      myKey: keys.security.siteKey,
      accountValidate: req.session.loginError});
  }

});

//Sub Routers ---->



router.get('/users/add-new-user',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      userAdmin.find({}, (err, user)=>{
        hold="user-add-new-user";
        res.render('admin/admin',{hold: hold, user: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus, userData: req.session.numberId});
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});



router.get('/users/:user',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      userAdmin.deleteOne({_id: req.params.user},(err)=>{
        if (err) throw err;
        res.redirect('/administrator/users');
        console.log('data deleted');
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
    teacherAdmin.deleteOne({idNumber: req.params.user}, (err)=>{
      if (err) throw err;
    });
  }else{
    res.redirect('../login-form')
  }
});


router.get('/subject/:user',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({},(err, user)=>{
        subjectAdmin.deleteMany({courseTitle: req.params.user},(err)=>{
          if (err) throw err;
          res.redirect('/administrator/subjects');
        });
        teacherAdmin.deleteMany({subject: req.params.user}, (err)=>{
          if (err) throw err;
        });
        schedAdmin.deleteMany({subject: req.params.user}, (err)=>{
          if (err) throw err;
        });
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});


router.get('/subjects/edit-subject/:courseTitle',(req, res)=>{
  hold= "user-edit-subject";
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({},(err, user)=>{
        subjectAdmin.find({courseTitle: req.params.courseTitle},(err, user2)=>{
          res.render('admin/admin', {hold: hold, user:user, user2: user2, courseTitle: req.params.courseTitle, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      }).sort({typeOfCurriculum:1, courseTitle:1});
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});



router.get('/subjects/add-subject',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({typeOfCurriculum: 'new'},(err, user)=>{
        tblAdmin.find({idNumber: req.session.username},(err, user2)=>{
          subjectAdmin.find({typeOfCurriculum: 'old'},(err, user3)=>{
            hold="user-add-subject";
            res.render('admin/admin',{hold: hold, user:user, addCurriculum: user2, user3: user3, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
          });
        })
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});


router.get('/schedules/admin-add-schedules',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({}, (err, user)=>{
        sectionAdmin.find({},(err,user2)=>{
          userAdmin.find({teachingStatus: 'teaching'},(err, user3)=>{
            hold="admin-schedules";
            res.render('admin/admin',{hold: hold, subject: user, section: user2, teacher: user3, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
          }).sort({firstname:1});

        }).sort({strand:1, section:1});
      }).sort({typeOfCurriculum:1, courseTitle:1});
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});




router.get('/strands/add-section',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({},(err, user)=>{
        strandsAdmin.find({}, (err, user2)=>{
          hold="add-strands";
          option="section";
          res.render('admin/admin',{hold: hold, user:user, strands: user2, option:option, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});



router.get('/strands/add-strands',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({},(err, user)=>{
        tracksAdmin.find({}, (err, user2)=>{
          hold="add-strands";
          option="strands"
          res.render('admin/admin',{hold: hold, user:user, tracks: user2, option:option, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});

router.get('/strands/add-tracks',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      subjectAdmin.find({},(err, user)=>{
        hold="add-strands";
        option = "tracks";
        res.render('admin/admin',{hold: hold, user:user, option:option, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});


router.get('/settings/security',(req, res)=>{
  if (req.session.username && req.session.password){
      userAdmin.find({idNumber: req.session.username}, (err, user)=>{
        hold="settings-security";
        option="settings-security";
        res.render('admin/admin',{hold: hold, user: user, option: option, userType: req.session.userType, teachingStatus: req.session.teachingStatus, oldPassword: req.session.password, passwordAuth: 'false'});
      });
  }else{
    res.redirect('../login-form')
  }
});


router.get('/settings/enrollment',(req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      userAdmin.find({idNumber: req.session.username}, (err, user)=>{
          enrollmentSettings.find({}, (err, user2)=>{
            hold="settings-enrollment";
            option="settings-enrollment";
            res.render('admin/admin',{hold: hold, user: user, option: option, settings: user2, userType: req.session.userType, teachingStatus: req.session.teachingStatus, oldPassword: req.session.password, passwordAuth: 'false'});
          });
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});

router.get('/verify-new-student/:studentInfo', (req, res)=>{
  req.session.studentObjectId = req.params.studentInfo;
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      studentPending.find({_id: req.params.studentInfo},(err, user)=>{
        strandsAdmin.find({},(err, user2)=>{
          enrollmentSettings.find({_id: '5d5eac152b3cd10e8c764ef0'}, (err, user3)=>{

            enrollStudent.find({strand: user[0].strand, section: user[0].section, hiddenEnrollYear: user3[0].academicFirst , hiddenEnrollSem: user3[0].semester }, (err, user5)=>{
              if(user5.length>= user3[0].maxStudent){

                sectionAdmin.find({}, (err, user4)=>{
                  res.render('partials/admin/admin-verify-users',{
                    hold: hold,
                    student: user,
                    strand: user2,
                    studentCount: user5,
                    settings: user3,
                    section: user4,
                    full: true,
                    userType: req.session.userType,
                    teachingStatus: req.session.teachingStatus
                  });
                }).sort({strand: 1, section:1});

              }else{

                sectionAdmin.find({}, (err, user4)=>{
                  res.render('partials/admin/admin-verify-users',{
                    hold: hold,
                    student: user,
                    strand: user2,
                    studentCount: user5,
                    settings: user3,
                    section: user4,
                    full: false,
                    userType: req.session.userType,
                    teachingStatus: req.session.teachingStatus
                  });
                });
              }
            });
          })
        });
      });
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});


router.get('/student-information/:studentInfo', (req, res)=>{
  req.session.studentObjectId = req.params.studentInfo;

  if (req.session.username && req.session.password){
      enrollStudent.find({_id: req.params.studentInfo},(err, user)=>{
        strandsAdmin.find({},(err, user2)=>{
          res.render('partials/admin/admin-student-information',{hold: hold, student: user, strand: user2, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
        });
      });
  }else{
    res.redirect('../login-form')
  }
});


router.get('/schedule/:subject/:subjectName/:subjectTimeIn/:subjectDay/:subjectTimeOut/:strand', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      schedAdmin.deleteOne({_id: req.params.subject},(err, user)=>{
        console.log("subject deleted");
      });
      teacherAdmin.deleteMany({subject: req.params.subjectName, timeIn: req.params.subjectTimeIn, timeOut: req.params.subjectTimeOut, day: req.params.subjectDay, strand: req.params.strand },(err)=>{
        if (err) throw err;
        console.log('data deleted');
      });
      res.redirect('/administrator/schedules');
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});

router.get('/enrolment-modify-section/:sectionId/:sectionName/:sectionStrand', (req, res)=>{

  sectionAdmin.deleteOne({_id: req.params.sectionId}, (err)=>{
    if (err) throw err;
    console.log('data deleted');
  })
  res.redirect('/administrator/enrolment');
});


router.get('/enrolment-modify-strand/:strandId/:strandName/:strandTrack', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      strandsAdmin.deleteOne({_id: req.params.strandId}, (err)=>{
        if (err) throw err;
        console.log('data deleted');
      })
      res.redirect('/administrator/enrolment');
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});


router.get('/enrolment-modify-track/:trackId/:trackName', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'){
      tracksAdmin.deleteOne({_id: req.params.trackId}, (err)=>{
        if (err) throw err;
        console.log('data deleted');
      })
      strandsAdmin.deleteMany({tracks: req.params.trackName}, (err)=>{
        if (err) throw err;
      })
      res.redirect('/administrator/enrolment');
    }else{
      res.redirect('/administrator/page-not-found');
    }
  }else{
    res.redirect('../login-form')
  }
});

router.get('/view-schedule/:schedule', (req, res)=>{
  req.session.scheduleSubject = req.params.schedule;
  if (req.session.username && req.session.password){
    schedAdmin.find({strand: req.session.scheduleSubject}, (err, user)=>{
      console.log(user.length);
      res.render('partials/sub-partials/admin/preview-schedule', {schedule: req.session.scheduleSubject, subject: user});
    }).sort({day:1, timeIn:1});
  }else{
    res.redirect('../login-form')
  }
});

router.get('/student-requirements', (req,res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      tblRequirements.find({}, (err, user)=>{
        hold = "requirements"
        res.render('admin/admin', {hold: hold, requirements: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      });
    }
  }else{
    res.redirect('/administrator/login-form')
  }
});

router.get('/delete-student-requirements/:students', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator'  || req.session.userType==='E-Officer'){
      tblRequirements.deleteOne({lrn: req.params.students}, (err)=>{
        res.redirect('/administrator/student-requirements');
        console.log('Data Deleted Successfully');
      });
    }
  }else{
    res.redirect('/login-form')
  }
});



router.get('/edit-student-requirements/:students', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      req.session.studentRequirements = req.params.students;
      console.log(req.session.studentRequirements);
      tblRequirements.find({_id: req.params.students}, (err, user)=>{
        hold = "edit-requirements";
        res.render('admin/admin', {hold: hold, requirements: user, userType: req.session.userType, teachingStatus: req.session.teachingStatus});
      });
    }
  }else{
    res.redirect('../login-form')
  }
});


router.get('/edit-schedules/:schedId/:schedSubject/:schedTimeIn/:schedTimeOut/:schedDays/:schedStrands', (req, res)=>{
  if (req.session.username && req.session.password){
    if(req.session.userType==='Administrator' || req.session.userType==='E-Officer'){
      hold = "edit-schedule";
      res.render('admin/admin',{
        hold: hold,
        userType: req.session.userType,
        teachingStatus: req.session.teachingStatus,
        schedId: req.params.schedId,
        subject: req.params.schedSubject,
        timeIn: req.params.schedTimeIn,
        timeOut: req.params.schedTimeOut,
        days: req.params.schedDays,
        strands: req.params.schedStrands
      });
    }
  }else{
    res.redirect('../login-form')
  }
});


module.exports = router;
