'use strict';
module.exports = function(sequelize, DataTypes) {
  var items_mimes = sequelize.define('physical_items_mimes', {
    iid: DataTypes.INTEGER,
    mime: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return items_mimes;
};
