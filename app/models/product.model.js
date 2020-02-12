const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    userID: { type: String, required: true },
    // image?
})

module.exports = mongoose.model('Product', ProductSchema)
