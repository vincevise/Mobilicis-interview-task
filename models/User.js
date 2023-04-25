const mongoose = require('mongoose')



const UserSchema = new mongoose.Schema({
    id: Number,
    first_name: String,
    last_name: String,
    email: String,
    gender: String,
    income: String,
    city: String,
    quote: String,
    phone_price: Number,
    car: String  
})

const User = mongoose.model("User", UserSchema)

module.exports = {
    User,
    UserSchema
}