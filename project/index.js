import express from 'express';
import session from 'express-session';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

import mysql from 'mysql';
import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionSQL = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_balihalus'
});

const app = express();
const PORT = 8888;

app.use(express.json());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'pages'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));


// Middleware Function

function isLoggedIn(req, res, next){
  if(req.session.isLoggedIn){
    next();
  } else {
    res.redirect('/baliHalus/');
  }
}

function isLoggedOut(req, res, next){
  if(!req.session.isLoggedIn){
    next();
  } else {
    res.redirect('/baliHalus/');
  }
}

function authenticateToken(req, res, next) {
  if (req.session.isLoggedIn) {
    const authHeader = req.session.authHeader;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    let tokenVerified = false;

    jwt.verify(authHeader, 'secret', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.session.user = user;
      tokenVerified = true;
    });

    if (tokenVerified) {
      return next();
    }
  }

  res.redirect('/baliHalus/');
}


function getStoreBranch(filter, callback) {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT * FROM `branch` WHERE `branch` LIKE '%" + filter + "%' OR `location` LIKE '%" + filter + "%'", (error, results) => {
        if (error) {
          console.error('Error:', error);
          callback(error, null);
        } else {
          callback(null, results);
        }

        connection.release();
      });
    }
  });
}

function getVariantMaster(serviceId, callback) {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT * FROM `variant_mst` WHERE `id_service` = " + serviceId + "", (error, results) => {
        if (error) {
          callback(error, null);
        } else {
          callback(null, results);
        }

        connection.release();
      });
    }
  });
}

function getVariantDetail(serviceId, callback) {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT b.* FROM `variant_mst` a LEFT JOIN `variant_det` b ON a.id_variant=b.id_parent WHERE a.`id_service` = " + serviceId + "", (error, results) => {
        if (error) {
          callback(error, null);
        } else {
          callback(null, results);
        }

        connection.release();
      });
    }
  });
}

function getTransactionMaster(userId, dateStart, dateEnd, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if((dateStart != undefined && dateStart != null && dateStart != "") && (dateEnd != undefined && dateEnd != null && dateEnd != "")){
        connection.query("SELECT a.id_trans AS id_trans, a.trans_num AS trans_num, a.`reservation_time` AS reservation_time, c.`service` AS service, f.`branch` AS branch, f.`location` AS location FROM transactions_mst a LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"' AND a.reservation_time BETWEEN '"+dateStart+"' AND '"+dateEnd+"'", (error, results) => {
          if (error) {
            connection.release();
            callback(error, null);
          } else {
            connection.release();
            callback(null, results);
          }
        });
      }
      else{
        connection.query("SELECT a.id_trans AS id_trans, a.trans_num AS trans_num, a.`reservation_time` AS reservation_time, c.`service` AS service, f.`branch` AS branch, f.`location` AS location FROM transactions_mst a LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"'", (error, results) => {
          if (error) {
            connection.release();
            callback(error, null);
          } else {
            connection.release();
            callback(null, results);
          }
        });
      }
      
    }
  });
}

function getTransactionDetail(userId, idTrans,callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if(idTrans != undefined && idTrans != null && idTrans != ""){
        connection.query("SELECT a.id_trans AS id_trans, b.`id_trans_det` AS id_trans_det, e.`variant` AS variant, d.`variant_det` AS variant_detail FROM transactions_mst a LEFT JOIN transactions_det b ON a.id_trans=b.`id_parent` AND a.id_trans='"+idTrans+"' LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN variant_det d ON b.`id_variant_det`=d.`id_variant_det` LEFT JOIN variant_mst e ON d.`id_parent`=e.`id_variant` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"'", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }
  
          connection.release();
        });
      } else {
        connection.query("SELECT a.id_trans AS id_trans, b.`id_trans_det` AS id_trans_det, e.`variant` AS variant, d.`variant_det` AS variant_detail FROM transactions_mst a LEFT JOIN transactions_det b ON a.id_trans=b.`id_parent` AND a.id_trans='"+idTrans+"' LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN variant_det d ON b.`id_variant_det`=d.`id_variant_det` LEFT JOIN variant_mst e ON d.`id_parent`=e.`id_variant` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }
  
          connection.release();
        });
      }
    }
  });
}


// PAGE REQ
app.get('/baliHalus/' ,(req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      services = 'Internal Server Error';
    } else {
      connection.query("SELECT * FROM services WHERE deleted_at IS NULL", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          services = 'Internal Server Error';
        } else {
          if(req.session.isLoggedIn){
            res.render('client/home',{login: true, name: req.session.name, services: results, page: 'Home'});
          }
          else{
            res.render('client/home', {login : false, services: results, page: 'Home'});
          }
        }

        connection.release();
      });
    }
  });
});

app.get('/baliHalus/log-in', (req, res)=>{
  if(req.session.isLoggedin){
    req.session.role == 'admin' ? res.redirect('/baliHalus/admin-home') : res.redirect('/baliHalus/');
  }
  else{
    res.render('login');
  }
});

app.get('/baliHalus/sign-in', (req, res)=>{
  if(req.session.isLoggedin){
    req.session.role == 'admin' ? res.redirect('/baliHalus/admin-home') : res.redirect('/baliHalus/');
  }
  else{
    res.render('signin');
  }
});

app.get('/baliHalus/book', authenticateToken, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      connection.query("SELECT * FROM services WHERE service='" + req.query.service + "' LIMIT 1", (error, results) => {
        if (error) {
          console.error('Error:', error);
          res.status(500).send('Internal Server Error');
        } else {
          let filter = "";
          getStoreBranch(filter, (err, branchs) => {
            if (err) {
              console.error('Error:', err);
              res.status(500).send('Internal Server Error');
              branchs = null;
              connection.release();
            } else {
              getVariantMaster(results[0].id_service, (err, variantmst) => {
                if (err) {
                  console.error('Error:', err);
                  res.status(500).send('Internal Server Error');
                  variantmst = null;
                  connection.release();
                } else {
                  getVariantDetail(results[0].id_service, (err, variantdet) => {
                    if (err) {
                      console.error('Error:', err);
                      res.status(500).send('Internal Server Error');
                      variantdet = null;
                      connection.release();
                    } else {
                      res.render('client/book', {
                        page: results[0].service,
                        login: true,
                        data: results[0],
                        branchs: branchs,
                        variantmst: variantmst,
                        variantdet: variantdet,
                        name: req.session.name
                      });

                      connection.release();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get('/baliHalus/history', authenticateToken, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      getTransactionMaster(req.session.idUser, req.query.datestart ? "" : req.query.datestart, req.query.dateend ? "" : req.query.dateend, (error, result)=>{
        if(error){
          console.error('Error:', error);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('client/history', {
            page: 'History',
            login: true,
            data: result,
            name: req.session.name
          });
        }
      });
    }
  });
});


// PROGRESS
app.post('/baliHalus/registration', (req, res) => {
  const { name, gender, username, password, passwordver, phone, email } = req.body;

  const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      services = 'Internal Server Error';
    } else {
      connection.query("SELECT COUNT(*) AS totalRow FROM users WHERE username='"+username+"'", (error, results) => {
        if (results[0].totalRow > 0) {
          res.send('Username has been taken !');
        } else {
          connection.query("INSERT INTO users (`id_group`,`username`,`name`,`gender`,`password`,`phone`,`email`) VALUES (1,'"+username+"','"+name+"','"+gender+"',MD5('"+hashedPassword+"'),'"+phone+"','"+email+"')", (error, results) => {
            if (error) {
              res.send('Internal Error - Please Contact Admin');
            } else {
              connection.query("SELECT id_user FROM users WHERE username ='"+username+"'", (error, results) => {
                if (!results || error) {
                  res.send('Not Found - Please Contact Admin');
                } else {
                  req.session.isLoggedIn = true;
                  req.session.idUser = results[0].id_user;
                  req.session.name = name;
                  res.send('ok');
                }

                connection.release();
              });
            }
          });
        }
      });
    }
  });
});

app.post('/baliHalus/login', (req,res)=>{
  const { username, password } = req.body;

  const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT id_user,name FROM users WHERE username='"+username+"' AND password=MD5('"+hashedPassword+"')", (error, result)=>{
        if(error){
          res.send('Internal Error - Please Contact Admin');
        } else if (result == ""){
          res.send('Please check your username and password !');
        } else {
          const token = jwt.sign({ username: username }, 'secret');

          req.session.authHeader = token;
          req.session.isLoggedIn = true;
          req.session.idUser = result[0].id_user;
          req.session.name = result[0].name;
          res.send('ok');
        }
        connection.release();
      });
    }
  });
});

app.post('/baliHalus/reservation', authenticateToken, (req, res) => {
  const { idservice, branch, time, variant } = req.body;

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send("Internal Error - Please Contact Admin !");
    } else {
      connection.query("INSERT INTO transactions_mst (`id_branch`, `id_user`, `id_service`, `reservation_time`) VALUES ('" + branch + "', '" + req.session.idUser + "', '" + idservice + "', '" + time + "')", (error, result) => {
        if (error) {
          console.error('Error inserting into transactions_mst:', error);
          res.send("Internal Error - Please Contact Admin !");
        } else if (result === false) {
          res.send('Cant book your reservation - Please Contact Admin !');
        } else {
          connection.query("SELECT id_trans FROM transactions_mst WHERE `id_branch`='" + branch + "' AND `id_user`='" + req.session.idUser + "' AND `id_service`='" + idservice + "' AND `reservation_time`='" + time + "' LIMIT 1", (err, results) => {
            if (err) {
              console.error('Error selecting id_trans:', err);
              res.send('Internal Error - Please Contact Admin !');
            } else if (results === false) {
              res.send('Cant book your reservation - Please Contact Admin !');
            } else {
              const date = new Date(time);
              const year = date.getFullYear().toString().slice(-2);
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              const resultTime = year + month + day;
              
              connection.query("SELECT trans_num FROM transactions_mst WHERE trans_num LIKE '%BL"+resultTime+"%' ORDER BY id_trans DESC LIMIT 1", (err, numResult) => {
                let transNum = "";

                if(numResult == false || numResult == ""){
                  transNum += "BL"+resultTime+("1").toString().padStart(3, '0');
                } else{
                  transNum += "BL"+resultTime+(parseInt((numResult[0].trans_num).slice(-3))+1).toString().padStart(3, '0');
                }

                connection.query("UPDATE transactions_mst SET trans_num='"+transNum+"' WHERE id_trans='"+results[0].id_trans+"'", (err, insResult) =>{
                  if(err){
                    console.error(err);
                  } else {
                    const promises = [];
                    for (let i = 0; i < variant.split(' | ').length - 1; i++) {
                      const query = "INSERT INTO transactions_det (`id_parent`, `id_variant_det`) VALUES ('" + results[0].id_trans + "','" + variant.split(' | ')[i].split(' : ')[1] + "')";
                      const promise = new Promise((resolve, reject) => {
                        connection.query(query, (error, result) => {
                          if (error) {
                            console.error('Error inserting into transactions_det:', error);
                            reject(error);
                          } else if (result === false) {
                            reject('Cant book your reservation - Please Contact Admin !');
                          } else {
                            resolve();
                          }
                        });
                      });
                      promises.push(promise);
                    }

                    Promise.all(promises)
                      .then(() => res.send('ok'))
                      .catch((error) => {
                        console.error('Error in Promise.all:', error);
                        res.send('Internal Error - Please Contact Admin !');
                      })
                      .finally(() => {
                        connection.release();
                    });
                  }
                });
              });
            }
          });
        }
      });
    }
  });
});


app.get('/baliHalus/logout', isLoggedIn ,(req, res) =>{
  req.session.isLoggedIn = false;
  req.session.destroy();
  res.redirect('/baliHalus/');
});

// ASSETS REQ - CSS

app.get('/baliHalus/homecss', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/css/home.css');
  res.sendFile(filePath);
});

app.get('/baliHalus/signincss', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/css/signin.css');
  res.sendFile(filePath);
});

app.get('/baliHalus/bookcss', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/css/book.css');
  res.sendFile(filePath);
});

app.get('/baliHalus/historycss', (req,res)=>{
  const filePath = path.join(__dirname, 'includes/css/history.css');
  res.sendFile(filePath);
})

// ASSETS REQ - IMAGE

app.get('/baliHalus/header-image', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/home-background.jpg');
  res.sendFile(filePath);
});

app.get('/baliHalus/nav-header-image', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/spa-header.jpg');
  res.sendFile(filePath);
});

app.get('/baliHalus/nav-subheader-image', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/spa-subheader.jpg');
  res.sendFile(filePath);
});

app.get('/baliHalus/banner-image', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/'+req.query.services+'');
  res.sendFile(filePath);
});

app.get('/baliHalus/sign-image', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/sign-image.jpg');
  res.sendFile(filePath);
});

app.get('/baliHalus/logo-small', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/logo-small.png');
  res.sendFile(filePath);
});

app.get('/baliHalus/logo-square', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/images/logo-square.png');
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});