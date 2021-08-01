const { ClientBuilder } = require('@iota/client');
const { Converter } = require('@iota/iota.js');

async function run2() {
  const message_data = await client
    .getMessage()
    .data('cdce89007022ebd4371ee4efbc8909616a71fb1c097aabfc1d9ab20851edc994');

  console.log('Message: ', Converter.bytesToAscii(message_data));
}
run2();
