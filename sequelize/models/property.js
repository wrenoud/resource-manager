module.exports = function(sequelize, DataTypes) {
  var Property = sequelize.define('Property', {
    id: DataTypes.STRING,
    resource: DataTypes.STRING,
    property_def: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  })

  return Property
}
