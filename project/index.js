import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import bodyParser from 'body-parser';
import mysql from 'mysql';

import session from 'express-session';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionSQL = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'balihalus' 
});

const app = express();
const PORT = 8888;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});