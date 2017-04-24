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
    cometd.subscribe('/wwe/v3/voice', onMessage);
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

let login = () => {
  return xhr.post('/api/login', { username: $('#username').val(), password: $('#password').val() });
};

let logout = () => {
  return xhr.post('/api/logout');
};

let search = () => {
   return xhr.post(`/api/search?clientId=${cometd.getClientId()}`);
};

let broadcast = () => {
   return xhr.post('/api/broadcast');
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
  
  $('#login').click(login);
  $('#logout').click(logout);
  $('#connect').click(connect);
  $('#disconnect').click(disconnect); 
  $('#search').click(search);
  $('#broadcast').click(broadcast);
});
