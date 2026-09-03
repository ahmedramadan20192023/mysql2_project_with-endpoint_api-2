import express from 'express';
import mysql from 'mysql2';


const port = process.env.PORT || 4500;
const app = express();

/* config db  */
const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
} );


/* connect to database ... */
dbConnection.connect( ( err ) => {
    if ( err ) {
         console.log({message:'err connection in db',err:err.message});
    }
        
    console.log('db connection successfully');
    
} )








/* listen  about port number...  */
app.listen( port, () => {
     console.log(`server is running successfully on port number ${port}`);
     
})