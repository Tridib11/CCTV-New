document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Discover nearby ONVIF devices
    const response = await fetch('/discover');
    const devices = await response.json();

    const deviceList = document.getElementById('device-list');
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.xaddr;
      option.textContent = `${device.name} - ${device.xaddr}`;
      deviceList.appendChild(option);
    });

    document.getElementById('connect-button').addEventListener('click', connectToDevice);
  } catch (error) {
    console.error('Error discovering devices:', error);
  }
});

async function connectToDevice() {
  const cameraAddress = document.getElementById('device-list').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    // Fetch the stream URL from the backend
    const response = await fetch('/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xaddr: cameraAddress, user: username, pass: password }),
    });
    const data = await response.json();

    const videoElement = document.getElementById('video-stream');
    videoElement.src = data.streamUrl;
  } catch (error) {
    console.error('Error fetching stream:', error);
  }
}

async function controlPTZ(pan, tilt, zoom) {
  const cameraAddress = document.getElementById('device-list').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    await fetch('/control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xaddr: cameraAddress, user: username, pass: password, pan, tilt, zoom }),
    });
    console.log('PTZ control command sent:', { pan, tilt, zoom });
  } catch (error) {
    console.error('Error sending PTZ command:', error);
  }
}
