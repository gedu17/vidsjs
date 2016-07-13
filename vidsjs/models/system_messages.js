'use strict';
module.exports = function(sequelize, DataTypes) {
  var system_messages = sequelize.define('system_messages', {
    uid: DataTypes.INTEGER,
    msg: DataTypes.TEXT,
    read: DataTypes.INTEGER,
    severity: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return system_messages;
};