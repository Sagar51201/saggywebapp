require('dotenv').config();
import mysql from "mysql2";

let connection = mysql.createConnection({
    host: 'database-2.c3uwiasuqfca.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: '123456789',
    database: 'mydatabase'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = connection;
