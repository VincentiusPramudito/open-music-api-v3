require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
// const path = require('path');

// Albums
const album = require('./api/albums');
const AlbumValidator = require('./validators/albums');
const AlbumsService = require('./services/postgres/AlbumsServices');

// Songs
const song = require('./api/songs');
const SongValidator = require('./validators/songs');
const SongsService = require('./services/postgres/SongsServices');

// Users
const user = require('./api/users');
const UserValidator = require('./validators/users');
const UsersService = require('./services/postgres/UsersServices');

// Playlists
const playlist = require('./api/playlists');
const PlaylistValidator = require('./validators/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsServices');

// Playlist Songs
const playlistSongs = require('./api/playlistsongs');
const PlaylistSongValidator = require('./validators/playlistsongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');

// Playlist Song Activities
const playlistSongActivities = require('./api/playlistsongactivities');
const PlaylistSongActivityValidator = require('./validators/playlistsongactivites');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesServices');

// Collaborations Songs
const collaboration = require('./api/collaborations');
const CollaborationValidator = require('./validators/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsServices');

// Album Likes
const albumLikes = require('./api/albumlikes');
const AlbumLikesValidator = require('./validators/albumLikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validators/exports');

// Uploads
const uploads = require('./api/uploads');
// const StorageServiceLocal = require('./services/storage/StorageService');
const StorageServiceAWS = require('./services/s3/StorageService');
const UploadsValidator = require('./validators/uploads');

// Authentications
const authentication = require('./api/authentications');
const AuthenticationValidator = require('./validators/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsServices');
const TokenManager = require('./tokenize/TokenManager');

// cache
const CacheService = require('./services/redis/CacheService');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService();
  const albumLikesService = new AlbumLikesService(cacheService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const authenticationsService = new AuthenticationsService();
  // const storageServiceLocal = new StorageServiceLocal(path.resolve(__dirname, 'api/uploads/file/images'));
  const storageServiceAWS = new StorageServiceAWS();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumsService,
        validator: AlbumValidator
      }
    },
    {
      plugin: song,
      options: {
        service: songsService,
        validator: SongValidator
      }
    },
    {
      plugin: user,
      options: {
        service: usersService,
        validator: UserValidator
      }
    },
    {
      plugin: playlist,
      options: {
        service: playlistsService,
        validator: PlaylistValidator
      }
    },
    {
      plugin: playlistSongs,
      options: {
        playlistSongsService,
        playlistSongActivitiesService,
        songsService,
        playlistsService,
        validator: PlaylistSongValidator
      }
    },
    {
      plugin: playlistSongActivities,
      options: {
        playlistSongActivitiesService,
        playlistsService,
        validator: PlaylistSongActivityValidator
      }
    },
    {
      plugin: collaboration,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationValidator
      }
    },
    {
      plugin: albumLikes,
      options: {
        albumsService,
        service: albumLikesService,
        validator: AlbumLikesValidator
      }
    },
    {
      plugin: _exports,
      options: {
        playlistsService,
        service: ProducerService,
        validator: ExportsValidator
      }
    },
    {
      plugin: uploads,
      options: {
        albumsService,
        service: storageServiceAWS, //storageServiceLocal,
        validator: UploadsValidator
      }
    },
    {
      plugin: authentication,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      }
    }
  ]);

  server.ext('onPreResponse', (request, h) => {
    // get context response from request
    const { response } = request;

    // error client handling from internal
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`App is running on ${server.info.uri}`);
};

init();