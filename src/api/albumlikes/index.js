const AlbumLikesHandler = require('./handler');
const routes = require('../albumlikes/routes');

module.exports = {
  name: 'album_likes',
  version: '1.0.0',
  register: async (server, { albumsService, service, validator }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumsService, service, validator);
    server.route(routes(albumLikesHandler));
  }
};