// Using PostgreSQL for this project
// Database connection fail fix
// https://stackoverflow.com/questions/60678090/dbeaver-localhost-postgresql-connection-refused

// Tutorial taken from
// https://www.youtube.com/watch?v=7D0x79lLevs&ab_channel=WyattFleming


import { Sequelize } from "sequelize-typescript";
import { Client } from 'pg';


export const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password",
    database: "nahintest",
});

// const sequelize = new Sequelize({
//     host: "localhost",
//     database: "Comedy Bar DB",
//     port: 5432,
//     username: "postgres",
//     password: "password",
//     dialect: 'postgres'
// });

export const initDB = async () => {
    // await sequelize.authenticate();
    // await sequelize.sync({ alter: true });


    // client.connect();

    // client.query("SELECT * FROM User", (err, res)=> {
    //     if(!err){
    //         console.log(res.rows);
    //     }else{
    //         console.log(err.message);
    //     }
    // })

    // Connect to the "nahintest" database
    client.connect((err) => {
        if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
        }
    
        console.log('Connected to the database.');
    });
    
    // Query the data from the "User" table
    // client.query('SELECT * FROM "User"', (err, res) => {
    //     if (err) {
    //     console.error('Error querying the database:', err.stack);
    //     return;
    //     }
    
    //     console.log('Data from the "User" table:', res.rows);
    // });

    console.log("All good")
};