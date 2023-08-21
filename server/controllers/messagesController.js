const messageModel = require("../model/messageModel")
module.exports.addMessage = async (req, res, next) => {

    try
    {
        const {from, to, message,interpretation} = req.body;
        const data = await messageModel.create({
            message:{text:message},
            users:[from,to],
            sender: from,
            interpretation: interpretation,
        });

        if(data) {
            return res.json({msg: "Messagea added successfully"})
        }
        else
        {
            return res.join({msg: "Failed to add message to the database"});
        }
    }
    catch(ex)
    {
        next(ex);
    }
};
module.exports.getAllMessage = async (req, res, next) => {
    try{
        //console.log("getAllMessage")
        const {from,to} = req.body;
        const messages = await messageModel.find({
            users: {
                $all: [from, to],
            },
        })
        .sort({updatedAt: 1});
        const projectMessages = messages.map((msg)=>{
            return {
                fromSelf:msg.sender.toString() === from,
                message:msg.message.text,
                _id: msg._id,
                interpretation: msg.interpretation,
            };
        });
        res.json(projectMessages);
    }
    catch (ex)
    {
        
        next(ex)
    }
};


module.exports.delChat = async (req, res, next) => {

    try
    {
        const {from, to} = req.body;
        const deletedMessages = await messageModel.deleteMany({
            $or: [
              { users: [from, to] }, // Messages sent from 'from' to 'to'
              { users: [to, from] }  // Messages sent from 'to' to 'from'
            ]
          });
          

    return res.json({msg: "Messages deleted successfully."})

            
       
    }
    catch(ex)
    {
        next(ex);
    }
};