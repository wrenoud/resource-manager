module.exports = function(sequelize, DataTypes) {
  var ResourceDefinition = sequelize.define('ResourceDefinition', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    name: DataTypes.STRING,
    display: DataTypes.STRING,
    description: DataTypes.TEXT,
    view: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.PropertyDefinition, {foreignKey: "definition"});
        this.hasMany(models.Resource, {foreignKey: "definition"});
        this.hasMany(models.Permission, {foreignKey: "oid"});
      }
    }
  })

  return ResourceDefinition
}
