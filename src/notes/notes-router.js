const express = require('express');
const xss = require('xss');

const NotesService = require('./notes-service');
const { json } = require('express');
const jsonParser = express.json();
const notesRouter = express.Router();

const sanitizeNote = (note) => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  date_modified: note.date_modified,
  folder_id: note.folder_id,
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const newNote = {...req.body};
    NotesService.createNote(req.app.get('db'), newNote)
      .then(note => res.status(201).json(sanitizeNote(note)))
      .catch(next)
  })

notesRouter 
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(req.app.get('db'), req.params.note_id)
      .then(note => {
        if(!note) {
          return res.status(404).json({
            error: {message: 'note not found'}
          })
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sanitizeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), req.params.note_id)
      .then(() => res.status(204).end())
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const newData = {...req.body };

    NotesService.updateNote(req.app.get('db'), req.params.note_id, newData)
      .then(() => res.status(204).end())
      .catch(next);
  })

module.exports = notesRouter;