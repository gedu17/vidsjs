'use strict';
module.exports = function(sequelize, DataTypes) {
    var users_data = sequelize.define('users_data', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        uid: DataTypes.INTEGER,
        iid: DataTypes.INTEGER,
        name: DataTypes.STRING,
        seen: DataTypes.INTEGER,
        deleted: DataTypes.INTEGER,
        pid: DataTypes.INTEGER,
        type: DataTypes.INTEGER

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