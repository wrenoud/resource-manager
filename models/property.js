module.exports = function(sequelize, DataTypes) {
  var Property = sequelize.define('Property', {
    value: DataTypes.TEXT,
    cache: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.Resource, {foreignKey: 'resource'});
        this.belongsTo(models.PropertyDefinition, {foreignKey: 'definition'});
      }
    }
  })

  return Property
}
