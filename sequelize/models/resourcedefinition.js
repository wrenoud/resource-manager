module.exports = function(sequelize, DataTypes) {
  var ResourceDefinition = sequelize.define('ResourceDefinition', {
    id: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  })

  return ResourceDefinition
}
