import fs from 'fs/promises';

export const router = async (request, response) =>{
  console.log("URL : "+request.url);
  console.log("Method : "+ request.method);

  if(request.url == "/"){
    const content = await fs.readFile('./pages/index.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/requestcss"){
    const css = await fs.readFile('./includes/css/styles.css', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.end(css);
  }
  else if(request.url == "/nav-header-image"){
    const image = await fs.readFile('./includes/images/spa-header.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else if(request.url == "/nav-subheader-image"){
    const image = await fs.readFile('./includes/images/spa-subheader.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else{
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain');
    response.end("Not Found");
  }
};