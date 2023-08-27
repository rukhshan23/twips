const mongoose = require ("mongoose");

const messageSchema = new mongoose.Schema(
{
   message : {
    text: {
        type:String, 
        required:true,
        },
   },
   users: Array,
   sender : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
   },
   interpretation: {
    type: String, // Add the new field "interpretation" of type String
   },
   complexSentencesArray: {
    type: [String], // Array of strings
 },
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Messages", messageSchema)