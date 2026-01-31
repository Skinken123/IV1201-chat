'use strict';

const Validators = require('../util/Validators');
const ChatDAO = require('../integration/ChatDAO');
const UserDTO = require('../model/UserDTO');

/**
 * The application's controller. No other class shall call the model or
 * integration layer.
 */
class Controller {
  /**
   * Creates a new instance.
   */
  constructor() {
    this.chatDAO = new ChatDAO();
    // In Drizzle, the 'transaction manager' is just the DB instance itself
    this.db = this.chatDAO.db;
  }

  /**
   * Instantiates a new Controller object.
   *
   * @return {Controller} The newly created controller.
   */
  static async createController() {
    const contr = new Controller();
    await contr.chatDAO.createTables();
    return contr;
  }

  /**
   * Login a user. This is not a real login since no password is required. The
   * only check that is performed is that the username exists in the database.
   *
   * @param {string} username: The username of the user logging in.
   * @return {User} The logged in user if login succeeded, or null if login
   *                failed.
   * @throws Throws an exception if unable to attempt to login the specified
   *         user.
   */
  async login(username) {
    return this.db.transaction(async (tx) => {
      Validators.isNonZeroLengthString(username, 'username');
      Validators.isAlnumString(username, 'username');

      let users = await this.chatDAO.findUserByUsername(username, tx);
      if (users.length === 0) {
        // Auto-create user if not exists
        const newUser = await this.chatDAO.createUser(username, tx);
        users = [newUser];
      }
      const loggedInUser = users[0];
      await this.setUsersStatusToLoggedIn(loggedInUser, tx);
      return loggedInUser;
    });
  }

  /**
   * Checks if the specified user is logged in.
   *
   * @param {string} username: The username of the user logging in.
   * @return {UserDTO} A userDTO describing the logged in user if the user is
   *                   logged in. Null if the user is not logged in.
   * @throws Throws an exception if failed to verify whether the specified user
   *         is logged in.
   */
  async isLoggedIn(username) {
    return this.db.transaction(async (tx) => {
      Validators.isNonZeroLengthString(username, 'username');
      Validators.isAlnumString(username, 'username');
      const users = await this.chatDAO.findUserByUsername(username, tx);
      if (users.length === 0) {
        return null;
      }
      const loggedInUser = users[0];
      const loginExpires = new Date(loggedInUser.loggedInUntil);
      if (!this.isValidDate(loginExpires)) {
        return null;
      }
      const now = new Date();
      if (loginExpires < now) {
        return null;
      }
      return loggedInUser;
    });
  }

  /**
   * Adds the specified message to the conversation.
   *
   * @param {string} msg The message to add.
   * @param {UserDTO} author The message author.
   * @return {MsgDTO} The newly created message.
   * @throws Throws an exception if failed to add the specified message.
   */
  async addMsg(msg, author) {
    return this.db.transaction(async (tx) => {
      Validators.isNonZeroLengthString(msg, 'msg');
      Validators.isInstanceOf(author, UserDTO, 'user', 'UserDTO');
      return await this.chatDAO.createMsg(msg, author, tx);
    });
  }

  /**
   * Returns the message with the specified id.
   *
   * @param {number} msgId The id of the searched message.
   * @return {MsgDTO} The message with the specified id, or null if there was
   *                  no such message.
   * @throws Throws an exception if failed to search for the specified message.
   */
  async findMsg(msgId) {
    return this.db.transaction(async (tx) => {
      Validators.isPositiveInteger(msgId, 'msgId');
      return await this.chatDAO.findMsgById(msgId, tx);
    });
  }

  /**
   * Returns the user with the specified id.
   *
   * @param {number} id The id of the searched user.
   * @return {UserDTO} The user with the specified id, or null if there was
   *                  no such user.
   * @throws Throws an exception if failed to search for the specified user.
   */
  async findUser(id) {
    return this.db.transaction(async (tx) => {
      return await this.chatDAO.findUserById(id, tx);
    });
  }

  /**
   * Returns all messages
   *
   * @return {MsgDTO[]} An array containing all messages. The array will be
   *                    empty if there are no messages.
   * @throws Throws an exception if failed to search for the specified message.
   */
  async findAllMsgs() {
    return this.db.transaction(async (tx) => {
      return await this.chatDAO.findAllMsgs(tx);
    });
  }

  /**
   * Deletes the message with the specified id.
   *
   * @param {number} msgId The id of the message that shall be deleted.
   * @throws Throws an exception if failed to delete the specified message.
   */
  async deleteMsg(msgId) {
    return this.db.transaction(async (tx) => {
      Validators.isPositiveInteger(msgId, 'msgId');
      await this.chatDAO.deleteMsg(msgId, tx);
    });
  }

  /*
   * only 'private' helper methods below
   */

  // eslint-disable-next-line require-jsdoc
  async setUsersStatusToLoggedIn(user, tx) {
    const hoursToStayLoggedIn = 24;
    const now = new Date();
    user.loggedInUntil = now.setHours(now.getHours() + hoursToStayLoggedIn); // This might return a number, careful!
    // Utils: Date.setHours returns a timestamp number.
    // Drizzle expects Date object for timestamp mode in writes usually, OR number if it's raw.
    // Let's ensure it's a Date object if the DTO/DAO expects strict typing or if we want to be safe.
    // The previous code: 
    // user.loggedInUntil = now.setHours(...) -> this sets it to a number.
    // ChatDAO.updateUser(user) -> User.update(user) -> Sequelize handles numbers as dates often.
    // Drizzle: `loggedInUntil` in schema is `timestamp({ mode: 'date' })`.
    // It expects a JS Date object.
    // So `user.loggedInUntil` (on the DTO) currently holds a number after this line.
    // ChatDAO `updateUser` takes `user.loggedInUntil`.
    // Drizzle `update(...).set({ loggedInUntil: ... })`.
    // If we pass a number to Drizzle timestamp-mode-date column, it might complain or might work.
    // SAFEST: Convert back to Date.

    user.loggedInUntil = new Date(user.loggedInUntil);

    await this.chatDAO.updateUser(user, tx);
  }

  // eslint-disable-next-line require-jsdoc
  isValidDate(date) {
    return !isNaN(date.getTime());
  }
}
module.exports = Controller;
