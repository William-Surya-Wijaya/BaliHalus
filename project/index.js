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

// ===================================
// MIDDLEWARE FUNCTION
// ===================================

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
    res.redirect('/baliHalus/');
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

function getStoreBranch(filter, callback) {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT * FROM `branch` WHERE `branch` LIKE '%" + filter + "%' OR `location` LIKE '%" + filter + "%' AND deleted_at IS NULL", (error, results) => {
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
      connection.query("SELECT * FROM `variant_mst` WHERE `id_service` = " + serviceId + " AND deleted_at IS NULL", (error, results) => {
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

function getUserDetail(userId, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT * FROM users WHERE id_user='"+userId+"'", (error, results) => {
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
      connection.query("SELECT b.* FROM `variant_mst` a LEFT JOIN `variant_det` b ON a.id_variant=b.id_parent WHERE a.`id_service` = " + serviceId + " AND a.deleted_at IS NULL AND b.deleted_at IS NULL", (error, results) => {
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

function getTransactionCount(userId, dateStart, dateEnd, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if((dateStart != undefined && dateStart != null && dateStart != "") && (dateEnd != undefined && dateEnd != null && dateEnd != "")){
        connection.query("SELECT count(*) AS totalRow FROM transactions_mst a WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"' AND a.reservation_time BETWEEN '"+dateStart+" 00:00:00' AND '"+dateEnd+" 23:59:59'", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, Math.ceil(parseInt(results[0].totalRow)/8));
          }

          connection.release();
        });
      }
      else{
        connection.query("SELECT count(*) AS totalRow FROM transactions_mst a WHERE a.`deleted_at` IS NULL AND a.id_user='"+userId+"'", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, Math.ceil(parseInt(results[0].totalRow)/8));
          }

          connection.release();
        });
      }
    }
  });
}

function getThisTransaction(userId, transId, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      connection.query("SELECT * FROM transactions_mst a LEFT JOIN transactions_det b ON a.id_trans=b.id_parent LEFT JOIN branch c ON a.id_branch=c.id_branch LEFT JOIN services d ON a.id_service=d.id_service LEFT JOIN variant_det e ON b.id_variant_det=e.id_variant_det LEFT JOIN variant_mst f ON e.id_parent=f.id_variant WHERE a.id_user='"+userId+"' AND a.id_trans='"+transId+"'", (error, results) => {
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

function getServiceRevenue(serviceId, dateStart, dateEnd, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if((dateStart != undefined && dateStart != null && dateStart != "") && (dateEnd != undefined && dateEnd != null && dateEnd != "")){
        connection.query("SELECT s.service AS service, s.price*COUNT(t.id_service) AS totalRevenue FROM services s LEFT JOIN transactions_mst t ON s.id_service = t.id_service AND t.id_service = '"+serviceId+"' AND t.reservation_time BETWEEN '"+dateStart+" 00:00:00' AND '"+dateEnd+" 23:59:59' WHERE s.id_service = '"+serviceId+"' AND s.deleted_at IS NULL AND t.deleted_at IS NULL GROUP BY service", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }

          connection.release();
        });
      }
      else{
        connection.query("SELECT s.service AS service, s.price*COUNT(t.id_service) AS totalRevenue FROM services s LEFT JOIN transactions_mst t ON s.id_service = t.id_service AND t.id_service = '"+serviceId+"' WHERE s.id_service = '"+serviceId+"' AND s.deleted_at IS NULL AND t.deleted_at IS NULL GROUP BY service", (error, results) => {
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

function getServiceReservations(serviceId, dateStart, dateEnd, callback){
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      callback(err, null);
    } else {
      if((dateStart != undefined && dateStart != null && dateStart != "") && (dateEnd != undefined && dateEnd != null && dateEnd != "")){
        connection.query("SELECT s.banner AS banner, s.price AS price, s.id_service AS id_service, s.service AS service, COUNT(t.id_service) AS totalRevenue FROM services s LEFT JOIN transactions_mst t ON s.id_service = t.id_service AND t.id_service = '"+serviceId+"' AND t.reservation_time BETWEEN '"+dateStart+" 00:00:00' AND '"+dateEnd+" 23:59:59' WHERE s.id_service = '"+serviceId+"' AND s.deleted_at IS NULL AND t.deleted_at IS NULL GROUP BY service", (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }

          connection.release();
        });
      }
      else{
        connection.query("SELECT s.banner AS banner, s.price AS price, s.id_service AS id_service, s.service AS service, COUNT(t.id_service) AS totalRevenue FROM services s LEFT JOIN transactions_mst t ON s.id_service = t.id_service AND t.id_service = '"+serviceId+"' WHERE s.id_service = '"+serviceId+"' AND s.deleted_at IS NULL AND t.deleted_at IS NULL GROUP BY service", (error, results) => {
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

// ===================================
// PAGE REQ
// ===================================

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

app.get('/baliHalus/book', authenticateToken, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      connection.query("SELECT * FROM services WHERE service='" + req.query.service + "' AND deleted_at IS NULL LIMIT 1", (error, results) => {
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

app.get('/baliHalus/pass', authenticateToken, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      getUserDetail(req.session.idUser, (err, userDetail)=>{
        if(err){
          console.error('Error:', err);
          res.status(500).send('Internal Server Erro7r');
          connection.release();
        }
        else{
          getThisTransaction(req.session.idUser, req.query.id, (err, transDetail)=>{
            if(err){
              console.error('Error:', err);
              res.status(500).send('Internal Server Error');
              connection.release();
            }
            else{
              res.render('client/pass', {
                page: 'Reservation Pass',
                userdata: userDetail,
                transData: transDetail
              });
              connection.release();
            }
          });
        }
      })
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

app.get('/baliHalus/admin/reservations', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM transactions_mst a LEFT JOIN branch b ON a.id_branch=b.id_branch LEFT JOIN services c ON a.id_service=c.id_service WHERE a.deleted_at IS NULL", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
        } else {
          if(req.session.isLoggedIn){
            res.render('admin/reservation',{
              login: true, 
              name: req.session.name, 
              reservations: results, 
              page: 'Reservations'
            });
          }
          else{

          }
        }

        connection.release();
      });
    }
  });
});

app.get('/baliHalus/admin/addons', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM variant_mst a LEFT JOIN services b ON a.id_service = b.id_service WHERE b.deleted_at IS NULL AND a.deleted_at IS NULL", (error, addons) => {
        if (error) {
          console.error('Error executing query:', error);
        } else {
          connection.query("SELECT * FROM services a WHERE a.deleted_at IS NULL", (error, results) => {
            if (error) {
              console.error('Error executing query:', error);
            } else {
              if(req.session.isLoggedIn){
                res.render('admin/addon',{
                  login: true, 
                  name: req.session.name, 
                  addon: addons,
                  service: results,
                  page: 'Add On'
                });
              }
              else{

              }
              connection.release();
            }
          });
        };
      });
    }
  });
});

app.get('/baliHalus/admin/variant', authenticateToken, isAdmin, (req,res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      connection.query("SELECT * FROM variant_det a LEFT JOIN variant_mst b ON b.id_variant=a.id_parent WHERE a.deleted_at IS NULL AND b.deleted_at IS NULL", (error, variant) => {
        if (error) {
          console.error('Error executing query:', error);
        } else {
          connection.query("SELECT * FROM variant_mst a WHERE a.deleted_at IS NULL", (error, results) => {
            if (error) {
              console.error('Error executing query:', error);
            } else {
              if(req.session.isLoggedIn){
                res.render('admin/variant',{
                  login: true, 
                  name: req.session.name, 
                  variant: variant,
                  addon: results,
                  page: 'Variants'
                });
              }
              else{

              }
              connection.release();
            }
          });
        };
      });
    }
  });
});

app.get('/baliHalus/admin/services', authenticateToken, isAdmin, (req, res)=>{
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

        let servicesReservation = [];

        for (const idservice of servicesId) {
          const thisReservations = await new Promise((resolve, reject) => {
            getServiceReservations(idservice.id_service, null, null, (err, thisReservations) => {
              if (err) {
                reject(err);
              } else {
                resolve(thisReservations);
              }
            });
          });

          const serRes = {
            service: thisReservations[0].service,
            revenue: thisReservations[0].totalRevenue,
            id_service: thisReservations[0].id_service,
            banner: thisReservations[0].banner,
            price: thisReservations[0].price
          };
          servicesReservation.push(serRes);
        }

        res.render('admin/service', {
          page: 'Services',
          login: true,
          services: servicesReservation,
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
          connection.query("INSERT INTO users (`id_group`,`username`,`name`,`gender`,`password`,`phone`,`email`) VALUES (1,'"+username+"','"+name+"','"+gender+"',MD5('"+hashedPassword+"'),'"+phone+"','"+email+"')", (error, results) => {
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

app.post('/baliHalus/reservation', authenticateToken, (req, res) => {
  const { idservice, branch, time, variant } = req.body;

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send("Internal Error - Please Contact Admin !");
    } else {
      connection.query("SELECT COUNT(*) as count FROM transactions_mst WHERE id_branch='"+branch+"' AND id_user='"+req.session.idUser+"' AND id_service='"+idservice+"' AND reservation_time='"+time+"'", (error, countTrans)=>{
        if (err) {
          console.error('Error connecting to the database:', err);
          res.send("Internal Error - Please Contact Admin !");
        } else {
          if(countTrans[0].count > 0){
            res.send('A reservation for the same time already exists. !');
            connection.release();
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
        }
      });
    }
  });
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

app.post('/baliHalus/addServiceData', authenticateToken, isAdmin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).send('File upload error');
    } else if (err) {
      console.error('Error:', err);
      return res.status(500).send('Internal server error');
    }
    next();
  });
}, (req, res) => {

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while creating Service's data`);
    } else {
      const extension = req.file.originalname.split('.').pop();
      const filename = `${req.body.service}.${extension}`;

      connection.query("INSERT INTO services (`service`, `banner`, `price`) VALUES ('"+req.body.service+"','"+filename+"','"+req.body.price+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while creating Service's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/EditServiceData', authenticateToken, isAdmin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).send('File upload error');
    } else if (err) {
      console.error('Error:', err);
      return res.status(500).send('Internal server error');
    }
    next();
  });
}, (req, res) => {

  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while updating Service's data`);
    } else {
      const extension = req.file.originalname.split('.').pop();
      const filename = `${req.body.service}.${extension}`;

      connection.query("UPDATE services SET `service` = '"+req.body.service+"', `banner` = '"+filename+"', `price` = '"+req.body.price+"' WHERE id_service ='"+req.body.id_service+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send(`There is an error while updating Service's data`);
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/getServiceData', authenticateToken, isAdmin, (req, res) => {
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT * FROM services WHERE id_service='"+req.body.id_service+"'", (error, results) => {
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

app.post('/baliHalus/deleteServiceData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send(`There is an error while deleting user's data`);
    } else {
      connection.query("UPDATE services SET deleted_at=NOW() WHERE id_service='"+req.body.id_service+"'", (error, results) => {
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

app.post('/baliHalus/getAddonData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT * FROM variant_mst WHERE id_variant='"+req.body.id_variant+"'", (error, results) => {
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

app.post('/baliHalus/editAddonData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("UPDATE variant_mst SET id_service='"+req.body.id_service+"', variant='"+req.body.addon+"' WHERE id_variant='"+req.body.id_variant+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/addAddonData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("INSERT INTO variant_mst (`id_service`, `variant`) VALUES ('"+req.body.id_service+"', '"+req.body.addon+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/deleteAddonData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("UPDATE variant_mst SET deleted_at=NOW() WHERE id_variant='"+req.body.id_variant+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/getVariantData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("SELECT * FROM variant_det WHERE id_variant_det='"+req.body.id_variant_det+"'", (error, results) => {
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

app.post('/baliHalus/editVariantData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("UPDATE variant_det SET id_parent='"+req.body.id_parent+"', variant_det='"+req.body.variant_det+"' WHERE id_variant_det='"+req.body.id_variant_det+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {

          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/addVariantData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES ('"+req.body.id_parent+"', '"+req.body.variant_det+"')", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
        } else {
          res.send('ok');
        }

        connection.release();
      });
    }
  });
});

app.post('/baliHalus/deleteVariantData', authenticateToken, isAdmin, (req, res)=>{
  connectionSQL.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.send('failed');
    } else {
      connection.query("UPDATE variant_det SET deleted_at=NOW() WHERE id_variant_det='"+req.body.id_variant_det+"'", (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.send('failed');
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