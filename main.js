import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ path: './Config/dev.env' });

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

/* start creating API DATABASE ..  */
app.use(express.json())

/* 1. get all users */

/** in this api we will get all users by the client send the id in query params 
 * but there is an issue  may be sql injection attack because we are using string interpolation in the query so we need to use prepared statement or parameterized query to prevent sql injection attack
 * trade this by using ? and a placeholder for the value and pass the value as an array 
 * and use the execute method instead of query method to execute the prepared statement and better performance and security
 */

app.get( '/getAllUsers', ( req, res ) => {
     
     dbConnection.query( `select * from users where id = ${req.query.id}`, ( err, result, fields ) => {
          if ( err )
               return res.status( 500 ).json( { message: 'syntax query err ', err: err.message } );
          return res.status( 200 ).json( { message: 'get all users successfully', data: result } );
     })
} )

/* 2. get all users prepared statement */
/**
 * here we are using prepared statement to prevent sql injection attack and better performance and security
 */
app.get( '/getAllUsersPrepared', ( req, res ) => {
     const query = `select * from users where id = ?;`;
     dbConnection.execute( query, [ req.query.id ], ( err, result, fields ) => {
          if ( err )
               return res.status( 500 ).json( { message: 'syntax query err ', err: err.message } );
          return res.status( 200 ).json( { message: 'get all users successfully', data: result } );
          
     })
})


app.post( '/tables-users', ( req, res ) => {
     const query = ` create table users(
     id int (11) primary key  auto_increment,
     name varchar(255) not null ,
     email varchar(255) unique not null ,
     password varchar(255)
     
     
 );`;
     dbConnection.execute( query, ( err, result, fields ) => {
          if ( err )
               return res.status( 500 ).json( { message: 'syntax query err ', err: err.message } );
          return res.status( 200 ).json( { message: 'create table users successfully', data: result } );
     } )
} );
app.post( '/tables-products', ( req, res ) => {
      const query = `create table products(
    id int (11) primary key auto_increment,
    name varchar(255) not null ,
    price decimal(10,2) ,
    users_id int (11) not null ,
    constraint fk_users_products foreign key (users_id) references users (id) on update cascade  on delete cascade
);
`;
     dbConnection.execute( query, ( err, result, fields ) => {
          if ( err )
               return res.status( 500 ).json( { message: 'syntax query err ', err: err.message } );
          
     })
})

/* users cruds operation */

app.post( '/users/signup', ( req, res ) => {
     const { name, email, password } = req.body; 
     const checkEmailExist = `select id from users where email = ? `;
     dbConnection.execute( checkEmailExist, [ email ], ( err, result, fields ) => {
          if ( err )
               return res.status( 500 ).json( {
                    success: false,
                    message: 'syntax err in db query',
                    err:err.message
               } )
          if ( result.length )
               return res.status( 409 ).json( {
                    message:`conflict ${email} already exist `
               } )
          const insertQuery = `insert into users (name , email , password)values(?,?,?);`;
          dbConnection.execute( insertQuery, [ name, email, password ], ( err, result, fields ) => {
               if( err )
                return res.status(500).json({
                  success: false,
                  message: "syntax err in db query",
                  err: err.message,
                } );
               return res.status( 201 ).json( {
                    success: true,
                    message: 'Done user is created ... ',
                    result,
                    fields
               })
          })
     })

} )

app.post( '/users/login', ( req, res ) => {
     const { name, password } = req.body;
     const selectUsers = `select id , name , email from users where name = ? AND password = ? ; `;
     dbConnection.execute( selectUsers, [ name, password ], ( err, result, fields ) => {
          if ( err )
              return res.status(500).json({
                success: false,
                message: "syntax err in db query",
                err: err.message,
              } );
          if( !result.length )
           return res.status(404).json({
             success: false,
             message: "User not found",
           } );
          return res.status( 200 ).json( {
               success: true,
               message: "done user has been login ",
               user:result[0]
          })
     })
})

app.delete( '/users/delete/:id', ( req, res ) => {
     const { id } = req.params;
     const checkQuery = `select id , name , email from users where id = ?;`;
     dbConnection.execute( checkQuery, [ id ], ( err, result ) => {
          if (err)
            return res.status(500).json({
              success: false,
              message: "syntax err in db query",
              err: err.message,
            } );
          if (result.length === 0 ) 
               res.status( 404 ).json( {
                    message:`user with id ${id} not found `
               } )
          const queryDelete = `delete from users where id = ?;`;
          dbConnection.execute( queryDelete, [ id ], ( err, result, fields ) => {
               if ( err )
                     res.status(500).json({
                       success: false,
                       message: "syntax err in db query",
                       err: err.message,
                     } );
               if ( result.affectedRows === 0 )
                    res.status( 400).json( {
                         message:'not user deleted '
                    } )
               res.status( 200 ).json( {
                    success: true,
                    message: 'Done',
                    result,
                    fields
               })
               
          })
          
                
     })
} )


/* crud operation about products */

/* api - for insert new product table. */
app.post( '/product/insert-product', ( req, res ) => {
     const { name, price, users_id } = req.body;
     const checkUserExist = ` select id from users where id = ? ;`;
     dbConnection.execute( checkUserExist, [ users_id ], ( err, result, fields ) => {
          if ( err )
               res.status( 500 ).json( {
                    success: false,
                    message: "syntax err in db query",
                    err: err.message,
               } );
          if ( !result.length )
               return res.status( 404 ).json( {
                    message: 'user is not found who will insert this product'
               } )
          const insertQuery = `insert into products (name , price , users_id) values(?,?,?) ;`;
          dbConnection.execute( insertQuery, [ name, price, users_id ], ( err, result ) => {
               if ( err )
                    return res.status( 500 ).json( {
                         success: false,
                         message: "syntax err in db query",
                         err: err.message,
                    } );
               if ( result.affectedRows === 0 )
                    return res.status( 400 ).json( {
                         message: 'bad request there is no action happen'
                    } )
               return res.status( 200 ).json( {
                    
                    success: true,
                    result
               } )
          } )
     } )
} );

 /* get all product */
app.get( '/product/getProduct', ( req, res ) => {
     const query = `SELECT * FROM products`;
     dbConnection.execute( query, ( err, product ) => {
          if ( err )
               return res.status( 500 ).json( {
                    success: false,
                    message: `database error ....`,
                    
               } );
          return res.status( 200 ).json( {
               success: true,
               message: product
          } )
     } )
} );

/* Search About Product By Id  */
app.get( '/product/search/:p_id', ( req, res ) => {
     const { p_id } = req.params;
     /* check if the product id is exist or not  */
     const checkIdQuery = `SELECT * FROM products where id = ?`
     dbConnection.execute( checkIdQuery, [ p_id ], ( err, result, fields ) => {
          if ( err )
               return res.status( 404 ).json( {
                    success: false,
                    message: `err syntax db...`,
                    err: err.message
               } )
          if ( !result.length )
               return res.status( 404 ).json( {
                    success: false,
                    message: `Search ${ p_id } Id  Is Not Found `,
                    
               } )
          return res.status( 200 ).json( {
               success: true,
               result,
               

          } )
     } )
} );
/* update products attribute... */
app.patch( '/product/update/:id', ( req, res ) => {
     const { id } = req.params;
     const { name, price } = req.body;
     const updateQuery = `update products set name = ? , price = ?;`;
     dbConnection.execute( updateQuery, [ name, price, id ], ( err, result ) => {
          if ( err )
               return res.status( 500 ).json( {
                    success: false,
                    message: `database err`,
                    Error: err.message
               } )
          if ( result.affectedRows === 0 )
               return res.status( 404 ).json( {
                    success: false,
                    message: `product id is not found ...`
               } );
          return res.status( 200 ).json( {
               success: true,
               message: `Done`,
               result
          } )
     } )
} );

/* api - for delete product */
app.delete("/product/delete/:id", (req, res) => {
  const { id } = req.params;
  const deleteQuery = `delete from products where id = ? ;`;
  dbConnection.execute(deleteQuery, [ id], (err, result) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: `database err`,
        Error: err.message,
      });
    if (result.affectedRows === 0)
      return res.status(404).json({
        success: false,
        message: `product id is not found ...`,
      });
    return res.status(200).json({
      success: true,
      message: `Done`,
      result,
    });
  });
});

/* api - productOfSpecificUser_id */
app.get( '/product/getProductOfId/:user_id', ( req, res ) => {
     const { user_id } = req.params;
     const query = `select * from products where users_id =?;`;
     dbConnection.execute( query, [ user_id ], ( err, result ) => {
          if ( err )
               return res.status( 500 ).json( { message: err.message } );
          if ( result.length === 0 )
               return res.status( 404 ).json( { message: 'userid is not found' } )
          return res.status( 200 ).json( {
               success: true,
               result,
          })
     })
} )

/* api - get user with his product */
app.get( '/users/:userId/products', ( req, res ) => {
     const { userId } = req.params;
     const joinQuery = `SELECT u.id AS userId , u.name AS userName , p.id AS productId , p.name As productName
               FROM users u LEFT JOIN products p on u.id = p.users_id WHERE u.id = ?;`;
     dbConnection.execute( joinQuery, [ userId ], ( err, users ) => {
          if ( err )
               return res.status( 500 ).json( {
                    message: "database err syntax",
               } );
          if ( users.length === 0 )
               return res.status( 404 ).json( {
                    message: `user is not found `,
               } );
          return res.status( 200 ).json( {
               message: "Done",
               users,
          } );
     } );
} );
app.get("/users/products", (req, res) => {

  const joinQuery = `SELECT u.id AS userId , u.name AS userName , p.id AS productId , p.name As productName
               FROM users u INNER JOIN products p on u.id = p.users_id ;`;
  dbConnection.execute(joinQuery,(err, users) => {
    if (err)
      return res.status(500).json({
        message: "database err syntax",
      });
    if (users.length === 0)
      return res.status(404).json({
        message: `user is not found `,
      });
    return res.status(200).json({
      message: "Done",
      users,
    });
  });
});
/* listen  about port number...  */
app.listen( port, () => {
     console.log(`server is running successfully on port number ${port}`);
     
})