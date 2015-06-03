module.exports = function(sequelize, DataTypes) {
  var Resource = sequelize.define('Resource', {
    id: DataTypes.STRING,
    definition: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  })

  return Resource
}
