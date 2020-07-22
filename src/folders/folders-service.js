const FoldersService = {
  createFolder(db, newFolder) {
    return db('folders')
      .insert(newFolder)
      .returning('*')
      .then(rows => {
        return rows[0]
      });
  },
  getAllFolders(db) {
    return db('folders').select();
  },
  getById(db, id) {
    return db('folders')
      .where({id}).first();
  },
  updateFolder(db, id, newData) {
    return db('folders')
      .where({id}).update(newData);
  },
  deleteFolder(db, id) {
    return db('folders')
      .where({id}).delete();
  },
};

module.exports = FoldersService;