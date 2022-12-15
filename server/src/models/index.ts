// Using PostgreSQL for this project
// Database connection fail fix
// https://stackoverflow.com/questions/60678090/dbeaver-localhost-postgresql-connection-refused

// Tutorial taken from
// https://www.youtube.com/watch?v=7D0x79lLevs&ab_channel=WyattFleming

import { Client } from 'pg';


export const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password",
    database: "nahintest",
});


export const initDB = async () => {

    // Connect to the "nahintest" database
    client.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            return;
        }
        
        console.log('Connected to the database.');
    });

    // client.query(`SELECT * FROM public."User"`, (err, res)=> {
    //     if(!err){
    //         console.log(res.rows);
    //     }else{
    //         console.log(err.message);
    //     }
    // })
    
};