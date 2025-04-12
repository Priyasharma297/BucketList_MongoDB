const express = require('express');
const path=require('path')
const mysql = require('mysql2');
const app = express();
app.set('view engine','hbs');        //for html
const dotenv=require('dotenv');     //for encryption

dotenv.config({path:'./.env'});

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    else{
    console.log("MYSQL connected....");
    }
});

const publicDirectory=path.join(__dirname,'./public')   //__dirname shows about the current file
//console.log("__dirname",__dirname);
app.use(express.static(publicDirectory))

app.get("/", (req, res) => {
    //res.send("<h1>HOME PAGE</h1>");
    res.render("index")                   //index.hbs will be send as response to the server
});

app.listen(5000, () => {
    console.log(`Server started on port 5000 => http://localhost:5000`);
});
