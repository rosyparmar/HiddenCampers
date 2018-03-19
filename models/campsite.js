var mongoose = require("mongoose");

var campsiteSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   location : String,
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Campsite", campsiteSchema);