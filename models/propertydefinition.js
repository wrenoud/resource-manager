module.exports = function(sequelize, DataTypes) {
  var PropertyDefinition = sequelize.define('PropertyDefinition', {
    name: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.ResourceDefinition);
        this.hasMany(models.Property, {foreignKey: "definition"});
      }
    }
  })

  return PropertyDefinition
}
