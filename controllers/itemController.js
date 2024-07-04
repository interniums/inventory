const { body, validationResult } = require('express-validator')
const Item = require('../models/item')
const Category = require('../models/category')
const asyncHandler = require('express-async-handler')
const item = require('../models/item')

exports.index = asyncHandler(async (req, res, next) => {
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ])
  res.render('index', {
    title: 'Inventory home page.',
    items_count: numItems,
    category_count: numCategories,
  })
})

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, 'name category')
    .sort({ name: 1 })
    .populate('category')
    .exec()

  res.render('item_list', { title: 'Item List', item_list: allItems })
})

exports.item_detail = asyncHandler(async (req, res, next) => {
  const [item, none] = await Promise.all([
    Item.findById(req.params.id).populate('category').exec(),
  ])

  if (item === null) {
    const err = new Error('Item not found')
    err.status = 404
    return next(err)
  }

  res.render('item_detail', {
    title: 'Item',
    item: item,
  })
})

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec()

  res.render('item_form', {
    title: 'Create Item',
    categories: allCategories,
  })
})

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === 'undefined' ? [] : [req.body.category]
    }
    next()
  },

  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('category.*').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const item = new Item({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
    })

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec()

      for (const category of allCategories) {
        if (item.category.includes(category._id)) {
          category.checked = 'true'
        }
      }

      res.render('item_form', {
        title: 'Create Item',
        categories: allCategories,
        errors: errors.array(),
      })
    } else {
      await item.save()
      res.redirect(item.url)
    }
  }),
]

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec()

  if (item === null) res.redirect('/catalog/items')

  res.render('item_delete', {
    title: 'Delete Item',
    item: item,
  })
})

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid)
  res.redirect('/catalog/items')
})

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec(),
  ])

  if (item === null) {
    const err = new Error('Item not found.')
    err.status = 404
    return next(err)
  }

  allCategories.forEach((category) => {
    if (item.category == category._id) {
      category.checked = 'true'
    }
  })

  res.render('item_form', {
    title: 'Update Item',
    categories: allCategories,
    item: item,
  })
})

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === 'undefined' ? [] : [req.body.category]
    }
    next()
  },

  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Descripton must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category.*').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category:
        typeof req.body.category === 'undefined' ? [] : req.body.category,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec()

      for (const category of allCategories) {
        if (item.category.indexOf(category._id) > -1) {
          category.checked = 'true'
        }
      }

      res.render('item_form', {
        name: 'Update Item',
        categories: allCategories,
        item: item,
        errors: errors.array(),
      })
      return
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {})
      res.redirect(updatedItem.url)
    }
  }),
]
