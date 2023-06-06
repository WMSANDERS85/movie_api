const http = require('http'),
  fs = require('fs'),
  url = require('url');

http
  .createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = '';
    // Updates log.txt file each time site is visited.
    fs.appendFile(
      'log.txt',
      // Logs the URL visited/linebread timestap date and 2 line
      'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n',
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      }
    );
    /* if the pathname includes documentation the user is directed to the documentation page
      if documentation is not included the user is taken to the index.html page*/
    if (q.pathname.includes('documentation')) {
      filePath = __dirname + '/documentation.html';
    } else {
      filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);
console.log('My test server is running on Port 8080.');
