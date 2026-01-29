'use strict';

const Sequelize = require('sequelize');
const User = require('./User');

/**
 * A message in the chat conversation.
 */
class Msg extends Sequelize.Model {
  /**
   * The name of the Msg model.
   */
  static get MSG_MODEL_NAME() {
    return 'msgs';
  }

  /**
   * Defines the Msg entity.
   *
   * @param {Sequelize} sequelize The sequelize object.
   * @return {Model} A sequelize model describing the Msg entity.
   */
  static createModel(sequelize) {
    Msg.init(
        {
          msg: {
            type: Sequelize.STRING,
            allowNull: false,
          },
        },
        {sequelize, modelName: Msg.MSG_MODEL_NAME, paranoid: true}
    );
    Msg.belongsTo(User);
    return Msg;
  }
}

module.exports = Msg;
