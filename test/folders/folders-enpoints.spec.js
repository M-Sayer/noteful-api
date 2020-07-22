const knex = require('knex');
const supertest = require('supertest');

const app = require('../../src/app');

const { makeFolders } = require('./folders.fixtures');
const { expect } = require('chai');

describe('folders endpoints', () => {
  let db;

  before('make connection to db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  afterEach('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  after('end db connection', () => db.destroy() );

  describe('GET /folders', () => {
    context('given no data', () => {
      it('responds 200 with empty list', () => {
        return supertest(app)
          .get('/folders')
          .expect(200, [])
      });
    });

    context('given data', () => {
      const testFolders = makeFolders();
      
      beforeEach('insert articles', () => {
        return db('folders').insert(testFolders)
      });

      it('responds 200 with list of folders', () => {
        return supertest(app)
          .get('/folders')
          .expect(200, testFolders);
      });
    });
  });

  describe('GET /folders/:folder_id', () => {
    context('given no data', () => {
      it('responds 404', () => {
        const id = 123456;
        return supertest(app)
          .get(`/folders/${id}`)
          .expect(404, {
            error: {message: 'folder not found'}
          })
      })
    })

    context('given data', () => {
      const testFolders = makeFolders();

      beforeEach('insert folders', () => db('folders').insert(testFolders));

      it('responds with 200 and folder matching id', () => {
        const id = 1;
        const expected = testFolders[id - 1]
        supertest(app)
          .get(`/articles/${id}`)
          .expect(200, expected)
      })
    })
  })

  describe('POST /folders', () => {
    it('creates a folder, responds 201 with new folder', () => {
      const newFolder = {
        folder_name: "new test"
      }

      return supertest(app)
        .post('/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.id).to.exist
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
        })
    })
  })

  describe('DELETE /folders/:folder_id', () => {
    context('given data', () => {
      const testFolders = makeFolders();

      beforeEach('insert folders', () => db('folders').insert(testFolders));
      
      it('responds 204 and deletes folder with matching id', () => {
        const id = 1;
        const expected = testFolders.filter(folder => folder.id !== id);
        return supertest(app)
          .delete(`/folders/${id}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/folders')
              .expect(expected));
      })
    })
  })

  describe('PATCH folders/:folder_id', () => {
    context('given data', () => {
      const testFolders = makeFolders();

      beforeEach('insert articles', () => db('folders').insert(testFolders));

      it('responds 204 and updates specified article', () => {
        const id = 1;
        const newData = { folder_name: "patch test" };
  
        return supertest(app)
          .patch(`/folders/${id}`)
          .send(newData)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/folders/${id}`)
              .expect(res => {
                expect(res.body.folder_name).to.eql(newData.folder_name)
              })
          )
      })
    })
  })


});

