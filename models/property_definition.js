module.exports = function(sequelize, DataTypes) {
  var PropertyDefinition = sequelize.define('PropertyDefinition', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    name: DataTypes.STRING,
    computed: DataTypes.BOOLEAN,
    equation: DataTypes.TEXT,
    default: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.ResourceDefinition, {foreignKey: "definition"});
        this.belongsTo(models.PropertyType, {foreignKey: "type"});
        this.hasMany(models.Property, {foreignKey: "definition"});
        this.hasMany(models.Permission, {foreignKey: "oid"});
      }
    }
  })

  return PropertyDefinition
}
