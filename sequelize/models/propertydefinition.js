module.exports = function(sequelize, DataTypes) {
  var PropertyDefinition = sequelize.define('PropertyDefinition', {
    id: DataTypes.STRING,
    resource_def: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  })

  return PropertyDefinition
}
