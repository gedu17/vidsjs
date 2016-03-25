'use strict';
module.exports = function(sequelize, DataTypes) {
  var items = sequelize.define('items', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: DataTypes.STRING,  
        parent: DataTypes.INTEGER,
        type: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return items;
};