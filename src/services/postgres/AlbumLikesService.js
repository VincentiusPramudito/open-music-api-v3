const { nanoid } = require('nanoid');
const ConnectPool = require('./ConnectPool');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor() {
    this._pool = ConnectPool();
  }

  async addLikes({ albumId, userId }) {
    const id = `likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Failed to like the album');
    }
    return result.rows[0].id;
  }

  async deleteLikes({ albumId, userId }) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Failed to remove likes');
    }
  }

  async getLikes({ albumId }) {
    const query = {
      text: 'SELECT COUNT(1) FROM album_likes WHERE album_id = $1',
      values: [albumId]
    };

    const result = await this._pool.query(query);
    return Number(result.rows[0].count);
  }

  async verifyAlbumLiked({ albumId, userId }) {
    const query = {
      text: 'SELECT COUNT(1) FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    };

    const result = await this._pool.query(query);
    if (result.rows[0].count > 0) {
      throw new InvariantError('Album already liked');
    }
  }
}

module.exports = AlbumLikesService;