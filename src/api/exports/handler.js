class ExportsHandler {
  constructor(playlistsService, service, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
  }

  postPlaylistsHandler = async (request, h) => {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      userId: request.auth.credentials.id,
      message: request.payload.targetEmail
    };

    await this._service.sendMessage('exports:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your request is on the queue'
    });
    response.code(201);
    return response;
  };
}

module.exports = ExportsHandler;