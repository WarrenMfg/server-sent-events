const serverSentEvents = () => {
  let hasServerRestarted = true;
  const id = Date.now();
  let intervalId;

  return res => {
    // set headers
    res.set({
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive'
    });

    // do once
    if (hasServerRestarted) {
      hasServerRestarted = false;

      res.write('event: refresh\n');
      res.write('data: refresh\n');
      res.write('id: ' + id + '\n\n');

      // do every other time
    } else {
      res.write('retry: 500\n');
      res.write('event: reconnected\n');
      res.write('data: RECONNECTED\n');
      res.write('id: ' + id + '\n\n');

      // heartbeat
      // clearInterval in case of manual refresh
      clearInterval(intervalId);
      // setInterval to keep connection from timing out
      intervalId = setInterval(() => {
        res.write('event: heartbeat\n');
        res.write('data: HEARTBEAT\n');
        res.write('id: ' + id + '\n\n');
      }, 60_000);
    }

    // for either first, or any consecutive requests,
    // we must end stream when nodemon restarts;
    // otherwise, ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK)
    // NOTE: frontend fires 'error' event due to disconnection
    const gracefulShutdown = () => {
      res.end();
      process.kill(process.pid, 'SIGUSR2');
    };
    process.removeAllListeners('SIGUSR2');
    process.once('SIGUSR2', gracefulShutdown);

    // for terminal Control + C command,
    // send event to frontend to close stream
    const signalInterrupt = () => {
      res.write('event: SIGINT\n');
      res.write('data: SIGINT\n\n');
      process.kill(process.pid, 'SIGUSR2');
    };
    process.removeAllListeners('SIGINT');
    process.once('SIGINT', signalInterrupt);
  };
};

const doOnce = serverSentEvents();
module.exports = (app, url) => {
  app.get(url, (req, res) => {
    doOnce(res);
  });
};
