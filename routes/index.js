var express = require('express');


var router = express.Router();


var db = require('../lib/db');


router.get('/', async (req, res) => {


try {


const leagueFilter = req.query.leagueType || null;


const weekFilter = req.query.week || null;


const yearFilter = req.query.year || 2022;


const positionFilter = req.query.position || null;


const teamFilter = req.query.team || null;


const searchFilter = req.query.search || null;


const sortedBy = req.query.sortedBy || 'starter_count';


const sortOrder = req.query.sortOrder || 'DESC';


let query = `


SELECT players.*, COUNT(*) AS player_count,


SUM(CASE WHEN safe_lineups.status = 'starter' THEN 1 ELSE 0 END) AS starter_count,


SUM(CASE WHEN safe_lineups.status = 'nonstarter' THEN 1 ELSE 0 END) AS nonstarter_count,


ROUND((SUM(CASE WHEN safe_lineups.status = 'starter' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS starting_percent,


SUM(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'W' THEN 1 ELSE 0 END) AS w_starts,


SUM(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'L' THEN 1 ELSE 0 END) AS l_starts,


ROUND((SUM(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'W' THEN 1 ELSE 0 END) / (SUM(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'W' THEN 1 ELSE 0 END) + SUM(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'L' THEN 1 ELSE 0 END))) * 100, 2) AS starting_win_percent,


ROUND(AVG(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'W' THEN safe_lineups.team_points END),2) AS avg_team_points,


ROUND(AVG(CASE WHEN safe_lineups.status = 'starter' AND safe_lineups.result = 'W' THEN safe_lineups.victory_margin END),2) AS avg_win_margin


FROM safe_lineups


JOIN players ON safe_lineups.player_id = players.id


JOIN safe_leagues ON safe_lineups.league_id = safe_leagues.league_id


WHERE safe_leagues.year = ? AND safe_lineups.year = ?`;


const conditions = [];


const params = [yearFilter, yearFilter];


if (leagueFilter) {


conditions.push('safe_leagues.type = ?');


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


query += ' AND ' + conditions.join(' AND ');


}


if (['starter_count', 'nonstarter_count', 'starting_percent', 'w_starts', 'l_starts', 'starting_win_percent','avg_team_points','avg_win_margin'].includes(sortedBy)) {


query += ` GROUP BY players.id ORDER BY ${sortedBy} ${sortOrder}`;


} else {


query += ` GROUP BY players.id ORDER BY players.${sortedBy} ${sortOrder}`;


}


db.query(query, params, (errors, results) => {


res.json({ results });


});


} catch (error) {


console.error(error);


res.status(500).json({ error: 'Internal Server Error' });


}


});


module.exports = router;