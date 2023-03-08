const onvif = require('node-onvif');

// Find the ONVIF network cameras
onvif.startDiscovery((info) => {
  // Show the information of the found device
  console.log(JSON.stringify(info, null, '  '));
});