const mongoose = require("mongoose");
const user = require("./User");
const { number } = require("zod");
const bankschema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    balance : {
        type : Number,
        required : true
    }
})

const account = mongoose.model('Accounts',bankschema);

module.exports = {
    account
}