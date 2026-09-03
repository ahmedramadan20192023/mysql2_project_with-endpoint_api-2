import express from 'express';
import mysql from 'mysql2';


const port = 3000;
const app = express();

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "workShop_9",
});

dbConnection.connect( ( err ) => {
    if ( err ) {
         console.log({message:'err connection in db',err:err.message});
    }
        
    console.log('db connection successfully');
    
} )


app.listen( port, () => {
     console.log(`server is running successfully on port number ${port}`);
     
})