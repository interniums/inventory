const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 24,
  },
  description: {
    type: String,
    maxLength: 999,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: String,
  },
  numberInStock: {
    type: Number,
  },
})

ItemSchema.virtual('url').get(function () {
  return `/catalog/item/${this._id}`
})

module.exports = mongoose.model('Item', ItemSchema)
