module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable('PropertyTypes', {
        name: DataTypes.STRING,
        view: DataTypes.STRING,
        controller: DataTypes.STRING
      })
      .complete(done)
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropTable('PropertyTypes')
      .complete(done)
  }
}
