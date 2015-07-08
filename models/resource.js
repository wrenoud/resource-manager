module.exports = function(sequelize, DataTypes) {
  var Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    cache: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.ResourceDefinition, {foreignKey: 'definition'});
        this.hasMany(models.Property, {foreignKey: 'resource'});
        this.hasMany(models.Permission, {foreignKey: "oid"});
      }
    }
  })

  return Resource
}
