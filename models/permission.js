module.exports = function(sequelize, DataTypes) {
  var Permission = sequelize.define('Permission', {
    type: DataTypes.ENUM("anon","user","group"),
    permission: DataTypes.ENUM("read","write"),
    identifier: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  })

  return Permission
}
