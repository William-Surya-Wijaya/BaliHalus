import http from 'http';
import {router} from './router.js';

const server = http.createServer(router);

server.listen(8888, ()=>{
  console.log('Server is Ready');
});