const Joi = require('joi');

const AlbumLikesPayloadSchema = Joi.object({
  albumId: Joi.string().required()
});

module.exports = AlbumLikesPayloadSchema;