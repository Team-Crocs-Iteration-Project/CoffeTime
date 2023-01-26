const User = require('./models/userModel');
const Event = require('./models/eventModel');
const _ = require('underscore');

module.exports = function (io) {
  // Delete socket to the namespace, before authentication
  _.each(io.nsps, function (nsp) {
    nsp.on('connect', function (socket) {
      if (!socket.auth) {
        console.log('removing socket from', nsp.name);
        delete nsp.connected[socket.id];
      }
    });
  });

  io.on('connection', (socket) => {
    socket.auth = false;
    socket.on('authenticate', async (auth) => {
      const { username, password } = auth;
      // Find user
      const user = await User.findOne({ username }).exec();
      if (user === null || user.password !== password) {
        socket.emit("error", { message: "Username or password incorrect" });
      } else {
        socket.auth = true;
        socket.user = user;
      }
    });
    setTimeout(() => {
      // If the authentication failed, disconnect socket
      if (!socket.auth) {
        console.log('CTO Unauthorized: Disconnecting socket ', socket.id);
        return socket.disconnect('unauthorized');
      }
      // If authentication succeeded, restore socket to the namespace
      _.each(io.nsps, function (nsp) {
        if (_.findWhere(nsp.sockets, { id: socket.id })) {
          nsp.connected[socket.id] = socket;
        }
        // We know websosckets are connected
        console.log('Server connected, websocket ID: ' + socket.id);
      });
      return socket.emit('authorized');
    }, 1000);
    socket.on('initialLoad', () => {
      // When connected, fetch the events
      // and send them to the frontend
      Event.find({}).then((initLoad) => {
        console.log('initLoad: ', initLoad);
        io.emit('initialLoad', initLoad);
      });
    });
    // listen to action 'newEvent',
    // once receive event from client, store it in databasa
    socket.on('newEvent', (newEvent) => {
      console.log('incoming event is: ', newEvent);
      //create new event in database
      Event.create(newEvent).then((data) => {
        console.log('new Event is: ', newEvent);
        io.emit('loadEvents', [newEvent]);
      });
    });
    socket.on('getUser', () => {
      socket.emit('user', {
        id: socket.user._id,
        username: socket.user.username,
        profileImage: socket.user.profileImage,
      });
    });
    socket.on('disconnect', () => {
      socket.disconnect('disconnect');
      console.log('disconnected');
    });
  });
};
