class AlbumLikesHandler {
  constructor(albumsService, service, validator) {
    this._albumsService = albumsService;
    this._service = service;
    this._validator = validator;
  }

  postAlbumLikesHandler = async (request, h) => {
    this._validator.validateAlbumLikesPayload(request.params);

    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._service.verifyAlbumLiked({ albumId, userId });

    await this._service.addLikes({ albumId, userId });
    const response = h.response({
      status: 'success',
      message: 'Album liked successfully'
    });
    response.code(201);
    return response;
  };

  deleteAlbumLikesHandler = async (request) => {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteLikes({ albumId, userId });
    return {
      status: 'success',
      message: 'Album removed successfully'
    };
  };

  getAlbumLikesHandler = async (request) => {
    const { albumId } = request.params;

    const likes = await this._service.getLikes({ albumId });
    return {
      status: 'success',
      data: {
        likes
      }
    };
  };
}

module.exports = AlbumLikesHandler;