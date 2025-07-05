const routes = require('./routes');
const UploadsHandler = require('./handler');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: (server, { albumsService, service, validator }) => {
    const uploadsHandler = new UploadsHandler(albumsService, service, validator);
    server.route(routes(uploadsHandler));
  }
};