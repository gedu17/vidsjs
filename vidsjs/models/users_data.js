'use strict';
module.exports = function(sequelize, DataTypes) {
    var users_data = sequelize.define('users_data', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user: DataTypes.INTEGER,
        item: DataTypes.INTEGER,
        data: DataTypes.TEXT,
        seen: DataTypes.INTEGER,
        deleted: DataTypes.INTEGER,
        parent: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        string: DataTypes.STRING

    }, {
    classMethods: {
            associate: function (models) {
                //users_data.belongsTo(models.users, { foreignkey: 'id' });
        // associations can be defined here
      }
    }
  });
  return users_data;
};