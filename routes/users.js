var express = require('express');
var router = express.Router();


/* GET u  sers listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
