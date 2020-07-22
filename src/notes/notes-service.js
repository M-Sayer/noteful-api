const NotesService = {
  createNote(db, newNote) {
    return db('notes')
      .insert(newNote).returning('*').then(rows => {
        return rows[0]
      })
  },
  getAllNotes(db) {
    return db('notes').select()
  },
  getById(db, id) {
    return db('notes').where({id}).first()
  },
  updateNote(db, id, newData) {
    return db('notes').where({id}).update(newData)
  },
  deleteNote(db, id) {
    return db('notes').where({id}).delete()
  },
}

module.exports = NotesService;