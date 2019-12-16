var http = require('http');
var fs =  require('fs');
http.createServer(function (req, res) {
  let contentType = "text/html";
  let file = "index.html"
  if(req.url.endsWith(".js")){
      file = req.url.slice(1);
      contentType = "text/javascript";
  }
  res.writeHead(200, {'Content-Type': contentType});
  fs.readFile(file,(err , data) => {
    res.write(data);
    res.end();
  })
  
}).listen(8080);