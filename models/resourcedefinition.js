module.exports = function(sequelize, DataTypes) {
  var ResourceDefinition = sequelize.define('ResourceDefinition', {
    name: DataTypes.STRING,
    shortname: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.PropertyDefinition);
        this.hasMany(models.Resource, {foreignKey: "definition"});
      }
    }
  })

  return ResourceDefinition
}
