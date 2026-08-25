const Project = require('../models/Project');
const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');

// @desc    Get all projects
// @route   GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    // Attach expense totals to each project
    const projectsWithTotals = await Promise.all(
      projects.map(async (project) => {
        const result = await Expense.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } },
        ]);
        const totalSpent = result.length > 0 ? result[0].totalSpent : 0;
        return {
          ...project.toObject(),
          totalSpent,
          remainingBudget: project.budget - totalSpent,
        };
      })
    );

    res.status(200).json({ success: true, count: projects.length, data: projectsWithTotals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get expense total
    const result = await Expense.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } },
    ]);
    const totalSpent = result.length > 0 ? result[0].totalSpent : 0;

    // Get category-wise spending
    const categorySpending = await Expense.aggregate([
      { $match: { projectId: project._id } },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        totalSpent,
        remainingBudget: project.budget - totalSpent,
        categorySpending,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    req.body.createdBy = req.user.id;
    const project = await Project.create(req.body);

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all expenses associated with this project
    await Expense.deleteMany({ projectId: project._id });

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
