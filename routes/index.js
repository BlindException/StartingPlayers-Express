var express = require('express');
var router = express.Router();
var db = require('../lib/db');
router.get('/', (req, res) => {
const leagueFilter = req.query.leagueType;
const weekFilter = req.query.week;


var query = 'SELECT winners.league_id, winners.starters, winners.week, leagues.type FROM winners JOIN leagues ON leagues.id = winners.league_id';


var conditions = [];


var params = [];


if (leagueFilter) {


conditions.push('type = ?');


params.push(leagueFilter);


}


if (weekFilter) {


conditions.push('week = ?');


params.push(weekFilter);


}


if (conditions.length > 0) {


query += ' WHERE ' + conditions.join(' AND ');


}


db.query(query, params, (err, results) => {


if (err) {


console.error(err);


res.status(500).send('Error retrieving data');


} else {


var totalStarters = 0;


var uniqueStarters = [];


const occurrences = {};


var failedIds = [];


const responseData = results.map((row) => {


const starters = row.starters.split(',');


const week = row.week;


starters.forEach((starter) => {


if (occurrences[starter]) {


for (var j = 0; j < uniqueStarters.length; j++) {


if (uniqueStarters[j].id == starter) {


uniqueStarters[j].starts++;


}


}


occurrences[starter]++;


} else {


uniqueStarters.push({


id: starter,


starts: 1,


});


occurrences[starter] = 1;


}


totalStarters++;


});


});


var playerQuery = 'SELECT id, name, team, position FROM players WHERE id = ?';


const positionFilter = req.query.position;


const teamFilter = req.query.team;


const searchFilter = req.query.search;


var playerConditions = [];


var playerParams = [];


if (positionFilter) {


playerConditions.push('position = ?');


playerParams.push(positionFilter);


}


if (teamFilter) {


playerConditions.push('team = ?');


playerParams.push(teamFilter);


}


if (searchFilter) {


playerConditions.push('name LIKE ?');


playerParams.push('%' + searchFilter + '%');


}


if (playerConditions.length > 0) {


playerQuery += ' AND ' + playerConditions.join(' AND ');


}


var playerQueries = uniqueStarters


.filter((starter) => starter.id !== null)


.map((starter) => {


return new Promise((resolve, reject) => {


var queryParams = [starter.id];


queryParams = queryParams.concat(playerParams);


db.query(playerQuery, queryParams, (error, playerResults) => {


if (error) {


reject(error);


} else {


if (playerResults.length === 0) {


failedIds.push(starter.id);


}


const players = playerResults.map((row) => {


return {


id: row.id,


name: row.name,


team: row.team,


position: row.position,


percent: starter.starts,
percentOfPlayers:0,
percentOfStarts:0,
};


});


resolve(players);


}


});


});


});


Promise.all(playerQueries)


.then((players) => {


for (var a = 0; a < players.length; a++) {


if (players[a] == []) {


players.splice(a, 1);


}


}


const sortedByPercent = players.flat().sort((a, b) => b.percent - a.percent);
const totalPlayers = sortedByPercent.length;
var totalStartsByQuery=0;
for(var i = 0;i<totalPlayers;i++)
{
    totalStartsByQuery+=sortedByPercent[i].percent;
}
for(var i = 0;i<totalPlayers;i++)
{
    let pop = (1/totalPlayers)*100;
    let pos = (sortedByPercent[i].percent/totalStartsByQuery)*100;
    sortedByPercent[i].percentOfPlayers=pop.toFixed(2);
    sortedByPercent[i].percentOfStarts=pos.toFixed(2);
}
const totalFailed = failedIds.length;


res.json({sortedByPercent, totalPlayers, totalStartsByQuery});


})


.catch((error) => {


console.error(error);


res.status(500).send('Error retrieving player data');


});


}


});


});


module.exports = router;