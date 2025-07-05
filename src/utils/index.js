/* eslint-disable camelcase */
const mapDBAlbumsColumnsToModel = ({
  id,
  name,
  year,
  songs,
  cover_url,
  created_at,
  updated_at,
}) => ({ id, name, year, songs, coverUrl: cover_url, createdAt: created_at, updatedAt: updated_at });

const mapDBSongsColumnsToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({ id, title, year, genre, performer, duration, albumId: album_id, createdAt: created_at, updatedAt: updated_at });



module.exports = { mapDBAlbumsColumnsToModel, mapDBSongsColumnsToModel };
