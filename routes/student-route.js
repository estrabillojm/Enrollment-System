const router = require('express').Router();

const trackAdmin = require('../models/admin-enrollment-tracks-model.js');
const strandAdmin = require('../models/admin-enrollment-strands-model.js');
const sectionAdmin = require('../models/admin-enrollment-section-model.js');
const tempStudent = require('../models/student-temp-model.js');
const enrollStudent = require('../models/student-enroll-model.js');
var captcha = require('../controller/myController.js');



router.get('/first-form-enrollment',(req, res)=>{

  if(req.session.success){
    if(req.session.studentClassification ==='old student' && req.session.oldStudent === 'existing' && req.session.generateData != true){

        res.render('user/old-student-generate',{ result: req.session.validate});
    }else{
      trackAdmin.find({}, (err, user)=>{
        strandAdmin.find({}, (err, user2)=>{

          if(req.session.generateData === true){
            enrollStudent.find({lrn: req.session.generateLrn},(err, user3)=>{
              res.render('user/user-form-first-step', {tracks: user, strands: user2, data: user3, generate: req.session.generateData});
            });
          }else{
            res.render('user/user-form-first-step', {tracks: user, strands: user2, data: 'nothing', generate: req.session.generateData});
          }
        })
      })
    }
  }else{
    res.redirect('/');
  }

});


router.get('/second-form-enrollment', (req,res)=>{
  if(req.session.success){
    if(req.session.dob){
      if(req.session.studentClassification ==='old student' && req.session.oldStudent === 'existing'){
          res.render('user/user-form-second-step');
      }else{
            if(req.session.generateData === true){
              enrollStudent.find({lrn: req.session.generateLrn},(err, user3)=>{
                res.render('user/user-form-second-step', {data: user3, generate: req.session.generateData});
              });
            }else{
          res.render('user/user-form-second-step', {data: 'nothing', generate: req.session.generateData});
        }
      }
    }else{
      res.redirect('/student/first-form-enrollment');
    }
  }else{
    res.redirect('/student/first-form-enrollment');
  }
});



router.get('/new-student-third-form-enrollment', (req,res)=>{
  if(req.session.success){
    if(req.session.dob){
      if(req.session.studentClassification ==='new student'){
        sectionAdmin.find({strand:req.session.strand},(err, user)=>{
          tempStudent.find({
          timeIn: req.session.studentTime,
          date: req.session.studentDate
          }, (err, user2)=>{
            tempStudent.find({dob: req.session.dob , timeIn: req.session.studentTime , date: req.session.studentDate}, (err, user4)=>{
              res.render('user/user-form-third-step-new-student-1', {section: user, retrieve: user4, student: user2, data: 'nothing', generate: req.session.generateData});
            });
          })
        }).sort({section:1})
      }else if(req.session.studentClassification === 'old student' && req.session.oldStudent === 'newRecord'){
        sectionAdmin.find({strand:req.session.strand},(err, user)=>{
          tempStudent.find({
          timeIn: req.session.studentTime,
          date: req.session.studentDate
          }, (err, user2)=>{
            tempStudent.find({dob: req.session.dob , timeIn: req.session.studentTime , date: req.session.studentDate}, (err, user4)=>{
              if(req.session.generateData === true){
                enrollStudent.find({lrn: req.session.generateLrn},(err, user3)=>{
                  res.render('user/user-form-third-step-new-student-1', {section: user, retrieve: user4, student: user2, data: user3, generate: req.session.generateData});
                });
              }else{
                res.render('user/user-form-third-step-new-student-1', {section: user, retrieve: user4, student: user2, data: 'nothing', generate: req.session.generateData});
              }
            });
          })
        }).sort({section:1})
      }
    }else{
      res.redirect('/student/first-form-enrollment');
    }
  }else{
    res.redirect('/student/second-form-enrollment')
  }
});

router.get('/new-student-last-form-enrollment', (req,res)=>{
  if(req.session.success){
    res.redirect ('/student/final-step-old-student');
  }else{
    res.redirect('/student/new-student-third-form-enrollment')
  }
});


router.get('/final-step-old-student', (req, res)=>{
  if(req.session.success){
    if(req.session.dob){
      res.render('user/generatePdf');
    }else{
      res.redirect('/student/first-form-enrollment');
    }
  }else{
    res.redirect('/student/second-form-enrollment')
  }
});

module.exports = router;
