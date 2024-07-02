#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
)

// Get arguments passed on command line
const userArgs = process.argv.slice(2)

const Item = require('./models/item')
const Category = require('./models/category')

const items = []
const categories = []

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const mongoDB = userArgs[0]

main().catch((err) => console.log(err))

async function main() {
  console.log('Debug: About to connect')
  await mongoose.connect(mongoDB)
  console.log('Debug: Should be connected?')
  await createCategories()
  await createItems()
  console.log('Debug: Closing mongoose')
  mongoose.connection.close()
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name })
  await category.save()
  categories[index] = category
  console.log(`Added category: ${name}`)
}

async function itemCreate(index, name, description, id, category) {
  const itemdetail = {
    name: name,
    description: description,
    id: id,
  }
  if (category != false) itemdetail.category = category

  const item = new Item(itemdetail)
  await item.save()
  items[index] = item
  console.log(`Added item: ${name}`)
}

async function createCategories() {
  console.log('Adding categories')
  await Promise.all([
    categoryCreate(0, 'pc'),
    categoryCreate(1, 'sport'),
    categoryCreate(2, 'home'),
  ])
}

async function createItems() {
  console.log('Adding Items')
  await Promise.all([
    itemCreate(
      0,
      'GPU',
      'Thing that running image on pc.',
      '9781473211896',
      categories[0]
    ),
    itemCreate(
      1,
      'shoes',
      'Thing that helping guys to run a little.',
      '3711453212816',
      categories[1]
    ),
    itemCreate(
      2,
      'CPU',
      'Thing that thinking in pc.',
      '2341123511846',
      categories[0]
    ),
    itemCreate(
      3,
      'shirt',
      'Small piece of clothing.',
      '2331423234826',
      categories[1]
    ),
    itemCreate(
      4,
      'washing mashine',
      'Thing that wash some stuff.',
      '2383344251826',
      categories[2]
    ),
    itemCreate(
      5,
      'chair',
      'Just sit here man.',
      '2733454211296',
      categories[2]
    ),
  ])
}
