const router = require('express').Router();

const strandsAdmin = require('../models/admin-enrollment-strands-model.js');

var holder = "";

router.get('/requirements',(req, res)=>{
  holder = "requirements";
  res.render('./dsashs/requirements', {hold: holder});
});

router.get('/strands',(req, res)=>{
  strandsAdmin.find({}, (err, user)=>{
    holder = "facilities";
    res.render('./dsashs/facilities', {hold: holder, strands: user});
  });

});


router.get('/about', (req, res)=>{


    holder = "about";
    res.render('./dsashs/about', {hold: holder});


});



module.exports = router;
