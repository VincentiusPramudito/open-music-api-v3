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

  getAlbumLikesHandler = async (request, h) => {
    const { albumId } = request.params;

    const objResult = await this._service.getLikes({ albumId });
    if (objResult.source == 'REDIS') {
      const response = h.response({
        status: 'success',
        data: {
          likes: objResult.data
        }
      });
      response.header('X-Data-Source', 'cache');
      return response;
    } else {
      return {
        status: 'success',
        data: {
          likes: objResult.data
        }
      };
    }
  };
}

module.exports = AlbumLikesHandler;