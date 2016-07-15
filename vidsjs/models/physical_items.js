'use strict';
module.exports = function(sequelize, DataTypes) {
  var items = sequelize.define('physical_items', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        pid: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        upid: DataTypes.INTEGER,
        name: DataTypes.STRING,
        path: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return items;
};
