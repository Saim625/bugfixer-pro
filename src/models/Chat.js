const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    bugId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bug',
        required: true
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    text:{
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Chat', chatSchema)