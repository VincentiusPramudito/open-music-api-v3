class UploadsHandler {
  constructor(albumsService, service, validator) {
    this._albumService = albumsService;
    this._service = service;
    this._validator = validator;
  }

  postUploadImageHandler = async (request, h) => {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filelocation = await this._service.writeFile(cover, cover.hapi);
    await this._albumService.addCoverUrlToAlbumById(id, `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filelocation}`);

    const response = h.response({
      status: 'success',
      message: 'Cover uploaded successfully'
    });
    response.code(201);
    return response;
  };
}

module.exports = UploadsHandler;