module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('PropertyDefinitions', {
        id: DataTypes.STRING,
        resource_def: DataTypes.STRING,
        name: DataTypes.STRING,
        type: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('PropertyDefinitions')
      .complete(done)
  }
}
