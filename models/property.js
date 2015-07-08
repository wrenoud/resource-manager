module.exports = function(sequelize, DataTypes) {
  var Property = sequelize.define('Property', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    value: DataTypes.TEXT,
    cache: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.Resource, {foreignKey: 'resource'});
        this.belongsTo(models.PropertyDefinition, {foreignKey: 'definition'});
        this.hasMany(models.Permission, {foreignKey: "oid"});
      }
    }
  })

  return Property
}
