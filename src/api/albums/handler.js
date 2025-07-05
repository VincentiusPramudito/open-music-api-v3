class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postAlbumHandler = async (request, h) => {
    this._validator.validateAlbumPayload(request.payload);

    const id = await this._service.addAlbum(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Album added successfully',
      data: {
        albumId: id
      }
    });
    response.code(201);
    return response;
  };

  getAlbumByIdHandler = async (request, h) => {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album
      }
    });
    response.code(200);
    return response;
  };

  putAlbumByIdHandler = async (request) => {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album updated successfully'
    };
  };

  deleteAlbumByIdHandler = async (request) => {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted successfully'
    };
  };
}

module.exports = AlbumsHandler;