const onvif = require('node-onvif');

// Find the ONVIF network cameras
/*onvif.startDiscovery((info) => {
  // Show the information of the found device
  console.log(JSON.stringify(info, null, '  '));
});*/


// Create an OnvifDevice object
/*let device = new onvif.OnvifDevice({
  xaddr: 'http://192.168.210.34/onvif/device_service',
  user : 'admin',
  pass : 'admin12345'
});

// Initialize the OnvifDevice object
device.init().then((info) => {
  console.log('The OnvifDevice object has been initialized successfully.');
  console.log(JSON.stringify(info, null, '  '));
  let profile = device.getCurrentProfile();
  console.log(JSON.stringify(profile, null, '  '));
}).catch((error) => {
  console.log('[ERROR] ' + error.message);
})*/

/*Stream = require('node-rtsp-stream')
stream = new Stream({
  name: 'name',
  streamUrl: 'rtsp://192.168.210.30/user=admin_password=tlJwpbo6_channel=1_stream=0.sdp?real_stream',
  wsPort: 9001,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-f' : 'mpegts',
    '-codec:v' : 'mpeg1video',
    '-s' : '640x480',
    '-b:v' : '1000k',
    '-r': 25, // options with required values specify the value after the key
    '-bf' : 0,
    '-codec:a' : 'mp2',
    '-ar' : 44100, 
    '-ac' : 1, 
    '-b:a' : '64k',
    '-max_muxing_queue_size' : '9999'
  }
})*/

/*Stream = require('node-rtsp-stream')
stream = new Stream({
  name: 'name',
  streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
  wsPort: 9999,
  ffmpegOptions: { // options ffmpeg flags
    '-f' : 'mpegts',
    '-codec:v' : 'mpeg1video',
    '-s' : '640x360',
    '-b:v' : '700k', 
    '-r' : 25, 
    '-bf' : 0,
    '-codec:a' : 'mp2',
    '-ar' : 44100,
    '-ac' : 1,
    '-b:a' : '64k',
  }
})*/

Stream = require('node-rtsp-stream')
const camera = [32,33,34,38,200];
camera.forEach((i) => {
  // Get the UDP stream URL'
  let url = 'rtsp://admin:admin12345@192.168.210.'+i+':554/cam/realmonitor?channel=1&subtype=1';

  if(i != 200){
    stream = new Stream({
      name: 'name',
      streamUrl: url,
      wsPort: 9000 + i,
      ffmpegOptions: { // options ffmpeg flags
      '-stats': '', // an option with no neccessary value uses a blank string
      '-f' : 'mpegts',
      '-codec:v' : 'mpeg1video',
      '-s' : '640x480',
      '-b:v' : '1000k',
      '-r': 25, // options with required values specify the value after the key
      '-bf' : 0,
      '-codec:a' : 'mp2',
      '-ar' : 44100, 
      '-ac' : 1, 
      '-b:a' : '64k',
      '-max_muxing_queue_size' : '9999'
      }
    })
  } else {
    stream = new Stream({
      name: 'name',
      streamUrl: url,
      wsPort: 9000 + i,
      ffmpegOptions: { // options ffmpeg flags
      '-stats': '', // an option with no neccessary value uses a blank string
      '-f' : 'mpegts',
      '-codec:v' : 'mpeg1video',
      '-s' : '640x480',
      '-b:v' : '1000k',
      '-r': 25, // options with required values specify the value after the key
      '-bf' : 0,
      '-codec:a' : 'mp2',
      '-ar' : 44100, 
      '-ac' : 1, 
      '-b:a' : '64k',
      '-max_muxing_queue_size' : '9999'
      }
    })
  }

  console.log("URL :" + url);
})





