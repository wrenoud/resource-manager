module.exports = function(sequelize, DataTypes) {
  var PropertyType = sequelize.define('PropertyType', {
    name: DataTypes.STRING,
    view: DataTypes.TEXT,
    controller: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
         this.hasMany(models.PropertyDefinition, {foreignKey: "type"});
      }
    }
  })

  return PropertyType
}
