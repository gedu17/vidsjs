'use strict';
module.exports = function(sequelize, DataTypes) {
  var ConnectSession = sequelize.define('ConnectSession', {
    sid: DataTypes.STRING,
    expires: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ConnectSession;
};