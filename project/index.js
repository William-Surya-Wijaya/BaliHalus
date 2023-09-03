import express from 'express';
import session from 'express-session';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

import mysql from 'mysql';
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionSQL = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_kasir'
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

// ===================================
// MIDDLEWARE FUNCTION
// ===================================

console.log(crypto.createHash('sha256').update('password').digest('base64'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './includes/images/');
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.').pop();
    const filename = `${req.body.service}.${extension}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

function isLoggedIn(req, res, next){
  if(req.session.isLoggedIn){
    next();
  } else {
    res.redirect('/baliHalus/log-in');
  }
}

function authenticateToken(req, res, next) {
  if (req.session.isLoggedIn) {
    const authHeader = req.session.authHeader;

    if (!authHeader) {
      res.redirect('/baliHalus/forbidden');
    }

    let tokenVerified = false;

    jwt.verify(authHeader, 'secret', (err, user) => {
      if (err) {
        res.redirect('/baliHalus/forbidden');
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

// ===================================
// MODULE
// ===================================

function isAdmin(req, res, next){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT b.group FROM users a LEFT JOIN `group` b ON a.id_group=b.id_group WHERE a.id_user='"+req.session.idUser+"' LIMIT 1", (error, result)=>{
        if(error){
          console.error(error);
          res.send('Internal Error - Please Contact Admin');
        } else if (result == ""){
          res.send('Please check your username and password !');
        } else if (result != "") {
          if(result[0].group = "Admin"){
            next();
          }
          else{
            res.redirect('/baliHalus/forbidden');
          }
        }
        connection.release();
      });
    }
  });
}

function getTransactionMaster(userId, dateStart, dateEnd, page, callback){
  connectionSQL.getConnection((err, connection) => {
    let limit = "";
    if(parseInt(page) != NaN && page != undefined && page != null){
      limit += " LIMIT "+(page*8)+",8";
    }
    else{
      limit += " LIMIT 0,8";
    }
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if((dateStart != undefined && dateStart != null && dateStart != "") && (dateEnd != undefined && dateEnd != null && dateEnd != "")){
        connection.query("SELECT a.id_trans AS id_trans, a.trans_num AS trans_num, a.`reservation_time` AS reservation_time, c.`service` AS service, f.`branch` AS branch, f.`location` AS location, c.price AS price FROM transactions_mst a LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"' AND a.reservation_time BETWEEN '"+dateStart+" 00:00:00' AND '"+dateEnd+" 23:59:59' "+limit+"", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }

          connection.release();
        });
      }
      else{
        connection.query("SELECT a.id_trans AS id_trans, a.trans_num AS trans_num, a.`reservation_time` AS reservation_time, c.`service` AS service, f.`branch` AS branch, f.`location` AS location, c.price AS price FROM transactions_mst a LEFT JOIN services c ON a.`id_service`=c.`id_service` LEFT JOIN branch f ON a.`id_branch`=f.`id_branch` WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"' "+limit+"", (error, results) => {
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

// ===================================
// PAGE REQ
// ===================================

app.get('/baliHalus/', isLoggedIn ,(req, res)=>{
  res.render('admin/home',{login: true, name: req.session.name, services: results, page: 'Home'});
});

app.get('/baliHalus/log-in', (req, res)=>{
  if(req.session.isLoggedin){
    req.session.role == 'Admin' ? res.redirect('/baliHalus/admin/dashboard') : res.redirect('/baliHalus/');
  }
  else{
    res.render('login');
  }
});

app.get('/baliHalus/sign-in', (req, res)=>{
  if(req.session.isLoggedin){
    req.session.role == 'Admin' ? res.redirect('/baliHalus/admin/dashboard') : res.redirect('/baliHalus/');
  }
  else{
    res.render('signin');
  }
});

app.get('/baliHalus/forbidden', (req, res)=>{
  res.render('forbidden');
});

app.get('/baliHalus/history', authenticateToken, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      getTransactionCount(req.session.idUser, req.query.datestart ? req.query.datestart : "", req.query.dateend ? req.query.dateend : "", (err, totalPage)=>{
        if(err){
          console.error('Error:', err);
          res.status(500).send('Internal Server Error');
          totalPage=null;
          connection.release();
        } else {
          getTransactionMaster(req.session.idUser, req.query.datestart ? req.query.datestart : "", req.query.dateend ? req.query.dateend : "", req.query.page > totalPage-1 ? "0" : req.query.page, (error, result)=>{
            if(error){
              console.error('Error:', error);
              res.status(500).send('Internal Server Error');
              connection.release();
            } else {
              res.render('client/history', {
                page: 'History',
                login: true,
                curr: req.query.page == null || req.query.page == undefined || req.query.page == "" ? 0 : (req.query.page > totalPage-1 ? "0" : req.query.page),
                data: result,
                totalpage: totalPage,
                name: req.session.name,
                currstart: req.query.datestart==undefined ? "" : req.query.datestart,
                currend: req.query.dateend==undefined ? "" : req.query.dateend,
                par: "datestart="+req.query.datestart==undefined ? "" : req.query.datestart+"&dateend="+req.query.dateend==undefined ? "" : req.query.dateend+"&filter="+req.query.filter==undefined ? "" : req.query.filter
              });
              connection.release();
            }
          });
        }
      });
    }
  });
});

app.get('/baliHalus/admin/dashboard', authenticateToken, isAdmin, async (req, res) => {
  connectionSQL.getConnection(async (err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      try {
        const servicesId = await new Promise((resolve, reject) => {
          connection.query("SELECT id_service FROM services WHERE deleted_at IS NULL", (error, servicesId) => {
            if (error) {
              reject(error);
            } else {
              resolve(servicesId);
            }
          });
        });

        let servicePastRevenue = [];
        let servicesPastReservation = [];
        let servicesRevenue = [];
        let servicesReservation = [];

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dayPast = String(today.getDate() - 1).padStart(2, '0');
        const dayStart = String(today.getDate()).padStart(2, '0');

        const pastStartDate = `${year}-${month}-${dayPast}`;
        const startDate = `${year}-${month}-${dayStart}`;
        const endDate = `${year}-${month}-${dayStart}`;

        for (const idservice of servicesId) {
          const thisRevenue = await new Promise((resolve, reject) => {
            getServiceRevenue(idservice.id_service, startDate, startDate, (err, thisRevenue) => {
              if (err) {
                reject(err);
              } else {
                resolve(thisRevenue);
              }
            });
          });

          const thisReservations = await new Promise((resolve, reject) => {
            getServiceReservations(idservice.id_service, startDate, startDate, (err, thisReservations) => {
              if (err) {
                reject(err);
              } else {
                resolve(thisReservations);
              }
            });
          });

          const thisPastRevenue = await new Promise((resolve, reject) => {
            getServiceRevenue(idservice.id_service, pastStartDate, pastStartDate, (err, thisRevenue) => {
              if (err) {
                reject(err);
              } else {
                resolve(thisRevenue);
              }
            });
          });

          const thisPastReservations = await new Promise((resolve, reject) => {
            getServiceReservations(idservice.id_service, pastStartDate, pastStartDate, (err, thisReservations) => {
              if (err) {
                reject(err);
              } else {
                resolve(thisReservations);
              }
            });
          });

          const serRev = {
            service: thisRevenue[0].service,
            revenue: thisRevenue[0].totalRevenue
          };
          servicesRevenue.push(serRev);

          const serRes = {
            service: thisReservations[0].service,
            revenue: thisReservations[0].totalRevenue,
          };
          servicesReservation.push(serRes);

          const pastSerRev = {
            service: thisPastRevenue[0].service,
            revenue: thisPastRevenue[0].totalRevenue
          };
          servicePastRevenue.push(pastSerRev);

          const pastSerRes = {
            service: thisPastReservations[0].service,
            revenue: thisPastReservations[0].totalRevenue,
          };
          servicesPastReservation.push(pastSerRes);
        }

        const reservations = await new Promise((resolve, reject) => {
          getTransactionMaster(req.session.idUser, startDate, endDate, null, (err, reservations) => {
            if (err) {
              reject(err);
            } else {
              resolve(reservations);
            }
          });
        });

        res.render('admin/home', {
          page: 'Dashboard',
          login: true,
          servicesRevenue: servicesRevenue,
          servicesReservation: servicesReservation,
          pastServicesRevenue: servicePastRevenue,
          pastServicesReservation: servicesPastReservation,
          reservations: reservations,
          name: req.session.name
        });

        connection.release();
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
        connection.release();
      }
    }
  });
});

app.get('/baliHalus/admin/users', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM users a LEFT JOIN `group` b ON a.id_group=b.id_group WHERE a.deleted_at IS NULL", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
        } else {
          if(req.session.isLoggedIn){
            res.render('admin/user',{
              login: true, 
              name: req.session.name, 
              users: results, 
              page: 'Users'
            });
          }
          else{
            res.render('admin/user', {
              login : false, 
              users: results, 
              page: 'Users'
            });
          }
        }

        connection.release();
      });
    }
  });
});

app.get('/baliHalus/admin/branchs', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM branch WHERE deleted_at IS NULL", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
        } else {
          if(req.session.isLoggedIn){
            res.render('admin/branch',{
              login: true, 
              name: req.session.name, 
              users: results, 
              page: 'Store Branchs'
            });
          }
          else{
            res.render('admin/branch', {
              login : false, 
              users: results, 
              page: 'Store Branchs'
            });
          }
        }

        connection.release();
      });
    }
  });
});

app.get('/baliHalus/admin/menu', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM menu WHERE deleted=0", (error, menu) => {
        res.render('admin/menu',{
          login: true, 
          name: req.session.name, 
          id: req.session.idUser,
          menu: menu,
          page: 'Menu'
        });

        connection.release();
      });
    }
  });
});

app.get('/baliHalus/admin/transaction', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT a.*,b.name AS nama_kasir FROM transaction_mst a LEFT JOIN users b ON a.created_by = b.id_user WHERE DATE(a.trans_time)=DATE(NOW())", (error, transaction) => {
        res.render('admin/transaction',{
          login: true, 
          name: req.session.name, 
          id: req.session.idUser,
          transaction: transaction,
          page: 'Transactions'
        });

        connection.release();
      });
    }
  });
});

// ===================================
// PROGRESS
// ===================================

app.post('/baliHalus/registration', (req, res) => {
  const { name, gender, username, password, passwordver, phone, email } = req.body;

  const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT COUNT(*) AS totalRow FROM users WHERE username='"+username+"'", (error, results) => {
        if (results[0].totalRow > 0) {
          res.send('Username has been taken !');
        } else {
          connection.query("INSERT INTO users (`id_group`,`username`,`name`,`gender`,`password`,`phone`,`email`) VALUES (2,'"+username+"','"+name+"','"+gender+"',MD5('"+hashedPassword+"'),'"+phone+"','"+email+"')", (error, results) => {
            if (error) {
              res.send('Internal Error - Please Contact Admin');
            } else {
              connection.query("SELECT id_user FROM users WHERE username ='"+username+"'", (error, results) => {
                if (!results || error) {
                  res.send('Not Found - Please Contact Admin');
                } else {
                  const token = jwt.sign({ username: username }, 'secret');

                  req.session.authHeader = token;
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
      connection.query("SELECT id_user,name,id_group FROM users WHERE username='"+username+"' AND password=MD5('"+hashedPassword+"')", (error, result)=>{
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
          res.send(result[0].id_group == 1 ? 'Admin' : 'ok');
        }
        connection.release();
      });
    }
  });
});

app.get('/baliHalus/logout', isLoggedIn ,(req, res) =>{
  req.session.isLoggedIn = false;
  req.session.destroy();
  res.redirect('/baliHalus/');
});

app.post('/baliHalus/getUserData', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT a.* FROM users a WHERE a.deleted_at IS NULL AND a.id_user='"+req.body.id_user+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send(results);
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/editUserData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while updating user's data`);
    } else {
      connection.query("UPDATE users SET username='"+req.body.username+"', gender='"+req.body.gender+"', `name`='"+req.body.name+"', phone='"+req.body.phone+"', email='"+req.body.email+"', id_group='"+req.body.id_group+"' WHERE id_user='"+req.body.id_user+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while updating user's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/deleteUserData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while deleting user's data`);
    } else {
      connection.query("UPDATE users SET deleted_at=NOW() WHERE id_user='"+req.body.id_user+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while deleting user's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/addUserData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while creating user's data`);
    } else {
      const hashedPassword = crypto.createHash('sha256').update(req.body.password).digest('base64');

      connection.query("INSERT INTO users (`id_group`,`username`,`gender`,`name`,`password`,`phone`,`email`) VALUES ('"+req.body.id_group+"','"+req.body.username+"','"+req.body.gender+"','"+req.body.name+"',MD5('"+hashedPassword+"'),'"+req.body.phone+"','"+req.body.email+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while creating user's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/getBranchData', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT a.* FROM branch a WHERE a.deleted_at IS NULL AND a.id_branch='"+req.body.id_branch+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send(results);
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/editBranchData', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while updating branch's data`);
    } else {
      connection.query("UPDATE branch SET `branch`='"+req.body.branch+"', `location`='"+req.body.location+"', `status`='"+req.body.status+"', updated_at=NOW() WHERE id_branch='"+req.body.id_branch+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while updating branch's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/deleteBranchData', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while deleting branch's data`);
    } else {
      connection.query("UPDATE branch SET `deleted_at`=NOW() WHERE id_branch='"+req.body.id_branch+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while deleting branch's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/addBranchData', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while creating branch's data`);
    } else {
      connection.query("INSERT INTO branch (`branch`, `location`, `status`) VALUES ('"+req.body.branch+"','"+req.body.location+"','"+req.body.status+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while creating branch's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/addMenuData', authenticateToken, isAdmin, (req, res, next) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while creating Menu's data`);
    } else {

      connection.query("INSERT INTO menu (`nama_menu`, `harga_menu`, `created_by`) VALUES ('"+req.body.nama_menu+"','"+req.body.harga_menu+"','"+req.body.id_edit+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while creating Menu's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/editMenuData', authenticateToken, isAdmin, (req, res, next) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while updating Menu's data`);
    } else {

      connection.query("UPDATE menu SET `nama_menu` = '"+req.body.nama_menu+"', `harga_menu` = '"+req.body.harga_menu+"', lastmodified=NOW(), modified_by='"+req.body.id_edit+"' WHERE id_menu ='"+req.body.id_menu+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while updating Menu's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/getMenuData', authenticateToken, isAdmin, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT * FROM menu WHERE id_menu='"+req.body.id_menu+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send(results);
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/deleteMenuData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while deleting user's data`);
    } else {
      connection.query("UPDATE menu SET deleted=1, lastmodified=NOW(), modified_by='"+req.body.id_edit+"' WHERE id_menu='"+req.body.id_menu+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while deleting user's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

// ===================================
// ASSETS REQ - CSS
// ===================================

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

app.get('/baliHalus/passcss', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/css/pass.css');
  res.sendFile(filePath);
});

app.get('/baliHalus/admincss', (req, res)=>{
  const filePath = path.join(__dirname, 'includes/css/admin.css');
  res.sendFile(filePath);
});

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