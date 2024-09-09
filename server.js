const express = require('express');
const onvif = require('node-onvif');
const app = express();
const port = 3000;

app.use(express.static('public')); // Serve static files
app.use(express.json()); // Parse JSON bodies

// Discover ONVIF cameras
app.get('/discover', async (req, res) => {
  try {
    console.log('Starting camera discovery...');
    const devices = await onvif.startProbe();
    const cameras = devices.map(device => ({
      urn: device.urn,
      name: device.name || 'Unnamed Device',
      xaddr: device.xaddrs[0]
    }));
    res.json(cameras);
  } catch (error) {
    res.status(500).send('Error discovering cameras: ' + error.message);
  }
});

// Get Stream URL
app.post('/stream', async (req, res) => {
  const { xaddr, user, pass } = req.body;

  const device = new onvif.OnvifDevice({ xaddr, user, pass });
  try {
    await device.init();
    const url = device.getUdpStreamUrl();
    res.json({ streamUrl: url });
  } catch (error) {
    res.status(500).send('Error initializing device: ' + error.message);
  }
});

// PTZ Control
app.post('/control', async (req, res) => {
  const { xaddr, user, pass, pan, tilt, zoom } = req.body;

  const device = new onvif.OnvifDevice({ xaddr, user, pass });
  try {
    await device.init();
    await device.ptzMove({
      speed: { x: pan, y: tilt, z: zoom },
      timeout: 1
    });
    res.send('PTZ move successful');
  } catch (error) {
    res.status(500).send('Error controlling PTZ: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
