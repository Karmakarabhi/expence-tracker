const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(
    [body('name').notEmpty().withMessage('Project name is required')],
    createProject
  );

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
