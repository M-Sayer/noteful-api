const express = require('express');
const xss = require('xss');

const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const sanitizeFolder = (folder) => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
});

foldersRouter 
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    if(newFolder.folder_name.length === 0){
      return res.status(400).json({
        error: {message: 'missing folder name'}
      })
    }

    FoldersService.createFolder(req.app.get('db'), newFolder)
      .then(folder => {
        res
          .status(201)
          .json(sanitizeFolder(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.folder_id;

    FoldersService.getById(db, id)
      .then(folder => {
        if(!folder) {
          return res.status(404).json({
            error: {message: 'folder not found'}
          })
        }
        res.folder = folder;
        next();
      })
  })
  .get((req, res, next) => {
    res.json(sanitizeFolder(res.folder))
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(() => res.status(204).end())
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newData = { folder_name };
    
    FoldersService.updateFolder(
      req.app.get('db'), req.params.folder_id, newData)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);   
  });

module.exports = foldersRouter;