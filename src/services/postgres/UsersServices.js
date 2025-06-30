const { nanoid } = require('nanoid');
const ConnectPool = require('./ConnectPool');
const InvariantError = require('../../exceptions/InvariantError');
const bcrypt = require('bcrypt');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersServices {
  constructor() {
    this._pool = ConnectPool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Failed to add new user');
    }

    return result.rows[0].id;
  }

  async verifyUserById(id) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [id]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('User not found');
    }
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    };

    const result = await this._pool.query(query);
    if (result.rows.length) {
      throw new InvariantError('Username already taken. Please, use another username');
    }
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError('Wrong credential');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Wrong credential');
    }

    return id;
  }
}

module.exports = UsersServices;