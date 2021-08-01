const express = require('express');
// const router = express.Router();
const logger = require('morgan');

const app = express();
const port = 8080;

app.use(logger('dev'));

const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'public')));
// app.use(express.static('public'));

app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', './views');

let orderPlaced = false;
let product = {};

app.get('/', (req, res) => {
  // console.log('Request Params:', req);
  if (!orderPlaced) {
    res.render('product');
    // res.sendfile('product.html');
  } else {
    res.render('thank_you', {
      product: product,
    });
  }
});

app.get('/order/ledger-nano-s', (req, res) => {
  orderPlaced = true;
  product.slug = 'ledger-nano-s';
  product.name = 'Ledger Nano S';
  product.status = 'Processing';

  res.render('thank_you', {
    product: product,
  });
  broadcastMessage('Order Received', 8081, 'localhost');
  product.status = 'Order Received';
  // res.send('Ledger Nano S order has been placed.');
});

app.get('/order/ledger-nano-x', (req, res) => {
  orderPlaced = true;
  product.slug = 'ledger-nano-x';
  product.name = 'Ledger Nano X';
  product.status = 'Processing';

  res.render('thank_you', {
    product: product,
  });
  broadcastMessage('Order Received', 8081, 'localhost');
  product.status = 'Order Received';
  // res.send('Ledger Nano X order has been placed.');
});

var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var server = dgram.createSocket('udp4');

const initMessagingServer = () => {
  server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  server.bind(8080);
};

const broadcastMessage = (data, port, ip) => {
  client.send(data, port, ip, () => {
    console.log(`Message ${data} sent to ${ip}:${port}`);
  });
};

const processIncomingMessage = (data, ip, port) => {
  console.log('Message [' + data + '] from [' + ip + ']:[' + port + ']' + '\n');
};

server.on('message', (msg, rinfo) => {
  processIncomingMessage(`${msg}`, rinfo.address, rinfo.port);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
  initMessagingServer();
});
