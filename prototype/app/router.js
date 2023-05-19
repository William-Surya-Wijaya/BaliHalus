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
  else if(request.url == "/sign-in"){
    const content = await fs.readFile('./pages/signin.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/signincss"){
    const css = await fs.readFile('./includes/css/signin.css', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.end(css);
  }
  else if(request.url == "/sign-image"){
    const image = await fs.readFile('./includes/images/sign-image.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else if(request.url == "/indexcss"){
    const css = await fs.readFile('./includes/css/index.css', 'utf-8');
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
  else if(request.url == "/spa-image"){
    const image = await fs.readFile('./includes/images/spa.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else if(request.url == "/massage-image"){
    const image = await fs.readFile('./includes/images/massage.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else if(request.url == "/refleksi-image"){
    const image = await fs.readFile('./includes/images/refleksi.jpg');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image');
    response.end(image);
  }
  else if(request.url == "/signed"){
    const content = await fs.readFile('./pages/index-signed.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/log-in"){
    const content = await fs.readFile('./pages/login.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/book-spa"){
    const content = await fs.readFile('./pages/book-spa.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/book-massage"){
    const content = await fs.readFile('./pages/book-massage.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/book-refleksi"){
    const content = await fs.readFile('./pages/book-refleksi.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/bookcss"){
    const content = await fs.readFile('./includes/css/book.css', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/book-history"){
    const content = await fs.readFile('./pages/book-history.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/historycss"){
    const content = await fs.readFile('./includes/css/history.css', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(content);
  }
  else if(request.url == "/39barcode"){
    const content = await fs.readFile('./includes/font/3of9_barcode/3OF9_NEW.ttf');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'font');
    response.end(content);
  }
  else{
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain');
    response.end("Not Found");
  }
};