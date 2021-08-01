const express = require('express');
const logger = require('morgan');

const app = express();
const port = 8081;

let packageBotId;
let deviceId;

app.use(logger('dev'));

app.on('receive_from_arduino', function (params) {
  if (params.device) {
    deviceId = parseInt(params.device);
  }

  if (params.out == 'packageBotId') {
    packageBotId = params.packageBotId;
  }

  return console.log('Message received from Arduino device: ', params);
});

app.on('send_to_arduino', function (inputData) {
  return console.log('Message sent to Arduino device: ', inputData);
});

app.get('/', function (req, res) {
  if (req.query.msg == 'output') {
    let data = 'Test reply back';

    app.emit('receive_from_arduino', req.query);

    return res.send(data);
  }

  if (req.query.msg == 'allinputs') {
    let data = {
      inputs: [{ device: deviceId, value: 777 }],
    };

    app.emit('send_to_arduino', data);
    return res.json(data);
  }

  return res.status(200).end();
});

// app.get('/', (req, res) => {
//   console.log("Request Params:",req);
// res.send({
//   "inputs": [
//     {"device": 253, "value": 777},
//     // {"device": 421, "value": 123},
//   ]
// })
// });

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

  server.bind(8081);
};

const broadcastMessage = (data, port, ip) => {
  client.send(data, port, ip, () => {
    console.log(`Message ${data} sent to ${ip}:${port}`);
  });
};

const processIncomingMessage = async (data, ip, port) => {
  console.log('Message [' + data + '] from [' + ip + ']:[' + port + ']' + '\n');

  //TODO: Send the relevant data to IOTA for the package being dispatched
  // Generate digital signature for
  // * Order number
  // * Package ID
  // Sign by IOTA “company private key”
  // Send this digital signature to IOTA

  console.log('deviceId:', deviceId);
  console.log('packageBotId:', packageBotId);

  // const messageData = await saveOrder();

  if (data === 'Order Received') {
    broadcastMessage(
      JSON.stringify({
        orderStatus: 'Order Dispatched',
        orderNumber: deviceId,
        packageBotId: packageBotId,
        iotaTransactionId: messageData,
      }),
      8080,
      'localhost'
    );
  }
};

server.on('message', (msg, rinfo) => {
  processIncomingMessage(`${msg}`, rinfo.address, rinfo.port);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
  initMessagingServer();
});

async function saveOrder() {
  const { ClientBuilder } = require('@iota/client');
  const dotenv = require('dotenv');

  dotenv.config();
  const client = new ClientBuilder()
    .node('https://api.lb-0.testnet.chrysalis2.com')
    .build();

  // Get the seed from environment variable
  const IOTA_SEED_SECRET = process.env.IOTA_SEED_SECRET;

  const messageData = JSON.stringify({
    orderNumber: this.deviceId, //tab id used just for simulation
    packageBotId: this.packageBotId,
  });

  console.log(messageData);

  /*
  const messageSender = new MessageSender().build();

  messageSender
    .data(
      JSON.stringify({
        ping: 'PONG',
      })
    )
    .seed(IOTA_SEED_SECRET)
    .output(
      'atoi1qqydc70mpjdvl8l2wyseaseqwzhmedzzxrn4l9g2c8wdcsmhldz0ulwjxpz',
      2
    )
    .submit();
*/
  /*
  const testMessage = await client
    .message()
    // .index('UM')
    .data('some UM utf based data')
    .submit();

  console.log(testMessage);
*/
  const message = await client
    .message()
    .seed(IOTA_SEED_SECRET)
    .output(
      'atoi1qqydc70mpjdvl8l2wyseaseqwzhmedzzxrn4l9g2c8wdcsmhldz0ulwjxpz', //random address
      1
    )
    .index('UM_' + this.deviceId)
    .data(messageData)
    .submit();

  console.log('Signed message from IOTA Client: ', message);
  return message;
}
