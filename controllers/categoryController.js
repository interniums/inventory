const { body, validationResult } = require('express-validator')
const Category = require('../models/category')
const Item = require('../models/item')
const asyncHandler = require('express-async-handler')

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec()

  res.render('category_list', {
    title: 'Category List',
    category_list: allCategories,
  })
})

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description').exec(),
  ])

  if (category === null) {
    const err = new Error('Category Not Found')
    err.status = 404
    return next(err)
  }

  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    category_items: itemsInCategory,
  })
})

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render('category_form', { title: 'Create Category' })
})

exports.category_create_post = [
  body('name', 'Category must contain at least 3 characters.')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    const category = new Category({ name: req.body.name })

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create category',
        category: category,
        errors: errors.array(),
      })
      return
    } else {
      const categoryExist = await Category.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec()

      if (categoryExist) {
        res.redirect(categoryExist.url)
      } else {
        await category.save()
        res.redirect(category.url)
      }
    }
  }),
]

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description').exec(),
  ])

  if (allItems.length > 0) {
    res.render('category_delete', {
      title: 'Delete Category',
      category: category,
      category_items: allItems,
    })
    return
  } else {
    await Category.findByIdAndDelete(req.body.categoryid)
    res.redirect('/catalog/categories')
  }
})

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description').exec(),
  ])

  if (category === null) {
    res.redirect('/catalog/categories')
  }

  res.render('category_delete', {
    title: 'Delete Category',
    category: category,
    category_items: allItems,
  })
})

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find().sort({ name: 1 }).exec(),
  ])

  if (category === null) {
    const err = new Error('Category not found.')
    err.status = 404
    return next(err)
  }

  res.render('category_form', {
    title: 'Update Category',
    items: allItems,
  })
})

exports.category_update_post = [
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const category = new Category({
      name: req.body.name,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Update Category',
        category: category,
        errors: errors.array(),
      })
      return
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      )
      res.redirect(updatedCategory.url)
    }
  }),
]
