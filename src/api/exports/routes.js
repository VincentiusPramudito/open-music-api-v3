const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postPlaylistsHandler,
    options: {
      auth: 'openmusicapp_jwt'
    }
  }
];

module.exports = routes;