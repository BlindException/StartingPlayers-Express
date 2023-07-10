var express = require('express');
var router = express.Router();
var db = require('../lib/db');
router.get('/', function(req, res) {
    var teamsQuery = 'SELECT DISTINCT team FROM players ORDER BY team ASC';
  db.query(teamsQuery,(error, results)=>{
        const teams = results.map((row)=>{
            return {
                id:row.team,
            };
        });
        res.json(teams);
                    });
});

module.exports = router;
