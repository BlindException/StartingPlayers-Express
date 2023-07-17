var express = require('express');


var router = express.Router();


var db = require('../lib/db');


router.get('/', async (req, res) => {


try {


const leagueFilter = req.query.leagueType || null;


const weekFilter = req.query.week || null;


const positionFilter = req.query.position || null;


const teamFilter = req.query.team || null;


const searchFilter = req.query.search || null;


const sortedBy = req.query.sortedBy || 'starter_count';


const sortOrder = req.query.sortOrder || 'DESC';


let query = `


SELECT players.*, COUNT(*) AS player_count,


SUM(CASE WHEN rosters.status = 'starter' THEN 1 ELSE 0 END) AS starter_count,


SUM(CASE WHEN rosters.status = 'nonstarter' THEN 1 ELSE 0 END) AS nonstarter_count,


ROUND((SUM(CASE WHEN rosters.status = 'starter' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS starting_percent


FROM rosters


JOIN players ON rosters.player_id = players.id


JOIN leagues ON rosters.league_id = leagues.id`;


const conditions = [];


const params = [];


if (leagueFilter) {


conditions.push('leagues.type = ?');


params.push(leagueFilter);


}


if (weekFilter) {


conditions.push('week = ?');


params.push(weekFilter);


}


if (positionFilter) {


conditions.push('players.position = ?');


params.push(positionFilter);


}


if (teamFilter) {


conditions.push('players.team = ?');


params.push(teamFilter);


}


if (searchFilter) {


conditions.push('players.name LIKE ?');


params.push(`%${searchFilter}%`);


}


if (conditions.length > 0) {


query += ' WHERE ' + conditions.join(' AND ');


}


if (['starter_count', 'nonstarter_count', 'starting_percent'].includes(sortedBy)) {


query += ` GROUP BY players.id ORDER BY ${sortedBy} ${sortOrder}`;


} else {


query += ` GROUP BY players.id ORDER BY players.${sortedBy} ${sortOrder}`;


}


db.query(query, params,((errors, results)=>{
    res.json({results});
}));
} catch (error) {


console.error(error);


res.status(500).json({ error: 'Internal Server Error' });


}


});


module.exports = router;