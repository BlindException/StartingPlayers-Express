var mysql = require('mysql');
require('dotenv').config();


const pool = mysql.createPool({


host: process.env.DB_HOST,


user: process.env.DB_USER,


password: process.env.DB_PASSWORD,


database: process.env.DB_NAME,


connectionLimit: 10, // Set the maximum number of connections in the pool


//timeout: 0


});


pool.getConnection(function(error, connection) {


if (error) {


console.log(error);


} else {


console.log('Connected..!');


connection.release(); // Release the connection back to the pool


}


});


module.exports = pool;