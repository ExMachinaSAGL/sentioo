const http = require('http');

// config port number running the script as: 
// node example_node_sse_server.js 4000
const port = process.argv[2] || process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(req.url);

  // Server-sent events endpoint
  if (req.url === '/subscribe') {
    console.log(req.url);
    // set response
    // header
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

    // body
    /*
    Example response:
      event: notify\n
      data: {
        "id":2,
        "title":"TEST",
        "text":"MEssaggio di test",
        "unread":true,
        "creationTime":"2018-09-25T15:23:48",
        "priority":0,
        "application":"ALL",
        "validFrom":"2018-09-25T15:23:48",
        "validTo":"2018-09-25T17:23:48",
        "type":"BROADCAST"
      }\n\n
    */
    let event = 'event: notify';
    let data = `data: ${JSON.stringify({
      "id":2,
      "title":"TEST",
      "text":"MEssaggio di test",
      "unread":true,
      "creationTime":"2018-09-25T15:23:48",
      "priority":0,
      "application":"ALL",
      "validFrom":"2018-09-25T15:23:48",
      "validTo":"2018-09-25T17:23:48",
      "type":"BROADCAST"
    })}`;

    console.log('RESPONSE:');
    console.log(`${event}\n${data}\n\n`);

    res.end(`${event}\n${data}\n\n`);
  }
  if (req.url.indexOf('/notifications') >= 0) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
    if (req.url.indexOf('/readAll') >= 0) {
      res.end();
    } else if (req.url.indexOf('/read') >= 0) {
      res.end();
    }
  }
});

server.listen(port);

server.on('error', (err) => {
  console.log(err);
  process.exit(1);
});

server.on('listening', () => {
  console.log(`Listening on port ${port}`);
});
