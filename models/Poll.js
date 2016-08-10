const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
   author: String,
   title: String,
   votes: [{option: String, votes: Number}],
   id: String,
   timeCreated : Number
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;