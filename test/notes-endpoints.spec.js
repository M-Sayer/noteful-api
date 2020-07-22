const knex = require('knex');

const app = require('../src/app');

const { makeFolders } = require('./folders/folders.fixtures');
const { makeNotes } = require('./notes.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');

describe('notes endpoints', () => {
  let db;

  before('create db connection', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  beforeEach('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  after('disconnect from db', () => db.destroy());


  describe('GET /notes', () => {
    context('given no data', () => {
      it('returns 200 with empty array', () => {
        supertest(app)
          .get('/notes')
          .expect(200, [])
      })
    });

    context('given data', () => {
      const testFolders = makeFolders();
      const testNotes = makeNotes();

      before('insert folders and notes', () => {
        return db('folders').insert(testFolders).then(() => {
          return db('notes').insert(testNotes)
        })
      });
      
      it('responds 200 with all notes', () => {
        supertest(app)
          .get('/notes')
          .expect(200, testNotes)
      })
    });

  })

  context('given data', () => {
    const testFolders = makeFolders();
    const testNotes = makeNotes();

    beforeEach('insert test data into folders and notes', () => {
      return db('folders').insert(testFolders).then(() => {
        return db('notes').insert(testNotes);
      });
    });

    describe('GET /notes/:note_id', () => {
      it('responds 200 with note matching id', () => {
        const id = 1;
        const expected = testNotes[id - 1];

        return supertest(app)
          .get(`/notes/${id}`)
          .expect(200, expected);
      })
    })

    describe('DELETE /notes/:note_id', () => {
      it('responds 204 and deletes note with matching id', () => {
        const id = 1;
        const expected = testNotes.filter(note => note.id !== id);

        return supertest(app)
          .delete(`/notes/${id}`)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/notes')
              .expect(expected)
          })

      });
    });

    describe('PATCH /notes/:note_id', () => {
      it('responds 204 and updates specified article', () => {
        const newData = {
          id: 3,
          note_name: 'update test',
          content: 'new content',
          folder_id: 3,
          date_modified: '2020-07-21T20:48:08.075Z',
        };

        return supertest(app)
          .patch(`/notes/${newData.id}`)
          .send(newData)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/notes/${newData.id}`)
              .expect(res => {
                expect(res.body.note_name).to.eql(newData.note_name);
              })
          })

      });
    });

    describe('POST /notes', () => {
      it('responds 201 with new note', () => {
        const newNote = {
          id: 4,
          note_name: 'note4',
          content: 'test post',
          folder_id: 3,
          date_modified: '2020-07-21T20:48:08.075Z',
        };
  
        return supertest(app)
          .post('/notes')
          .send(newNote)
          .expect(201, newNote)
      })
    })


  })

})