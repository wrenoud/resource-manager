module.exports = function(sequelize, DataTypes) {
  var ResourceDefinition = sequelize.define('ResourceDefinition', {
    name: DataTypes.STRING,
    display: DataTypes.STRING,
    description: DataTypes.TEXT,
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
