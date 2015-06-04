module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('Properties', {
        id: DataTypes.STRING,
        resource: DataTypes.STRING,
        property_def: DataTypes.STRING,
        value: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('Properties')
      .complete(done)
  }
}
