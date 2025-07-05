const { nanoid } = require('nanoid');

const ConnectPool = require('./ConnectPool');
const { mapDBAlbumsColumnsToModel } = require('../../utils');

const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor() {
    this._pool = ConnectPool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'INSERT into albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt]
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add album.');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      values: [id]
    };

    const result = await this._pool.query(queryAlbum);
    if (!result.rows.length) {
      throw new NotFoundError('Album not found.');
    }

    result.rows[0].songs = [];

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id]
    };

    const resultSongs = await this._pool.query(querySongs);
    if (resultSongs.rows.length) {
      result.rows[0].songs = [...resultSongs.rows];
    }

    return result.rows.map(mapDBAlbumsColumnsToModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album. Cannot find album.');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album. Cannot find album.');
    }
  }

  async addCoverUrlToAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Failed to add cover album"s url.');
    }
  }
}

module.exports = AlbumsService;