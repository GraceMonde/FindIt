//Safely loads the mysql db
const mysql = require('mysql2/promise');
require('dotenv').config();

//a connection pool to connect to db using credentials in .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    /*acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,*/
    charset: 'utf8mb4'
});

//Testing of the db connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

//Execute the query function
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// waits for a connection to the pool 
const getConnection = async () => {
    return await pool.getConnection();
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection
};
