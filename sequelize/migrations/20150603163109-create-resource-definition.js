module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('ResourceDefinitions', {
        id: DataTypes.STRING,
        name: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('ResourceDefinitions')
      .complete(done)
  }
}
