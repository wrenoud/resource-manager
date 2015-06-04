module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('Resources', {
        id: DataTypes.STRING,
        definition: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('Resources')
      .complete(done)
  }
}
