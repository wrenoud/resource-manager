module.exports = function(sequelize, DataTypes) {
  var PropertyType = sequelize.define('PropertyType', {
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    view: DataTypes.TEXT,
    pattern: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
         this.hasMany(models.PropertyDefinition, {foreignKey: "type"});
         this.hasMany(models.PropertyType, {foreignKey: "extends"});
      }
    }
  })

  return PropertyType
}
