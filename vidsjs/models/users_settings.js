'use strict';
module.exports = function(sequelize, DataTypes) {
  var users_settings = sequelize.define('users_settings', {
    type: DataTypes.STRING,
    value: DataTypes.STRING,
    uid: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return users_settings;
};