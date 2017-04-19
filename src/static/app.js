let cometd;
let connected = false;
let subscription;

let onHandshake = (handshake) => {
  if (handshake.successful === true) {
    /*if (subscription) {
      console.log('unsubscribing: ' + subscription);
      cometd.unsubscribe(subscription);
    }*/
    
    console.log('subscribing to channels...');
    cometd.subscribe('/wwe/v3/voice/username', onMessage);
    cometd.subscribe(`/wwe/v3/voice/username/${handshake.clientId}`, onMessage);
  } 
};

let onConnect = (message) => {
  if (cometd.isDisconnected()) {
    return;
  }

  let wasConnected = connected;
  connected = message.successful;
  if (!wasConnected && connected) {
    console.log('cometd connected.');
  } else if (wasConnected && !connected) {
    console.log('cometd connection lost...');
  }
};

let onMessage = (msg) => {
  console.log('cometd message received:', JSON.stringify(msg));
};

let onDisconnect = (message) => {
  if (message.successful) {
    connected = false;
    console.log('cometd disconnected.');
  }
};

let connect = () => {
  cometd.handshake(); 
};

let disconnect = () => {
  cometd.disconnect();
};

$(document).ready(() => {
  cometd = $.cometd;
  cometd.unregisterTransport("websocket");

  cometd.addListener('/meta/handshake', onHandshake);
  cometd.addListener('/meta/connect', onConnect);
  cometd.addListener('/meta/disconnect', onDisconnect);
  cometd.configure({
    url: '/cometd/notifications'/*,
    logLevel: "debug"*/
  });
  
  $('#connect').click(connect);
  $('#disconnect').click(disconnect); 
});
