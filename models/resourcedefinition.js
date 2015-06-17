module.exports = function(sequelize, DataTypes) {
  var ResourceDefinition = sequelize.define('ResourceDefinition', {
    name: DataTypes.STRING,
    shortname: DataTypes.STRING,
    view: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.PropertyDefinition, {foreignKey: "definition"});
        this.hasMany(models.Resource, {foreignKey: "definition"});
      }
    }
  })

  return ResourceDefinition
}
