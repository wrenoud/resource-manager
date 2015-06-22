module.exports = function(sequelize, DataTypes) {
  var PropertyDefinition = sequelize.define('PropertyDefinition', {
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
      }
    }
  })

  return PropertyDefinition
}
