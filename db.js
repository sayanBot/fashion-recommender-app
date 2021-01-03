
const Pool = require('pg').Pool

const pool = new Pool({
    host:'ec2-54-163-249-4.compute-1.amazonaws.com',
    user:'qmeqbvfzqmymvv',
    password:'09d334c8bb1372e9b16976b8a6137c085172e392fe17325c6cfb371b8a0fa18c',
    port:5432,
    database:'d1a706i9g57lk6',
    ssl:{
        rejectUnauthorized:false
    }
    
})

module.exports = pool;