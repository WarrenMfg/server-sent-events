// open a persistent connection to an HTTP server
// when nodemon restarts, `source` will
// automatically attempt to reconnect
const source = new EventSource('/reload');

// after nodemon restarts,
// a `refresh` event is sent from server;
// this event listener triggers a reload
source.addEventListener('refresh', () => {
  location.reload();
});

// after reload,
// a `reconnected` event is sent from server;
// this event listener is to indicate the
// connection has been successfully reconnected
source.addEventListener('reconnected', e => {
  console.log(e.data);
});

// after 2 minutes of no data transfer,
// `source` will timeout; therefore,
// this event listener listens for a heartbeat
source.addEventListener('heartbeat', e => {
  console.log(e.data);
});

// when nodemon restarts,
// the open stream is ended but `source` is not closed,
// which triggers the error event
source.addEventListener('error', () => {
  console.log('DISCONNECTED. RECONNECTING...');
});

// for terminal Control + C command,
// a `SIGINT` event is sent from server.
// this event listener clears the console
// and closes the stream
source.addEventListener('SIGINT', e => {
  console.clear();
  source.close();
});
