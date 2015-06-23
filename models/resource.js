module.exports = function(sequelize, DataTypes) {
  var Resource = sequelize.define('Resource', {
    cache: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.ResourceDefinition, {foreignKey: 'definition'});
        
        this.hasMany(models.Property, {foreignKey: 'resource'});
      }
    }
  })

  return Resource
}
