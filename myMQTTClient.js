var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://ec2-18-218-2-29.us-east-2.compute.amazonaws.com')
// var client  = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
  client.subscribe('house/bulb1', function (err) {
    if (!err) {
      client.publish('house/bulb1', 'Hello mqtt')
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
