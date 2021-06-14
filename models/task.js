const mongoose=require("mongoose");

const taskSchema=new mongoose.Schema({
    title:String,
    body:String,
    created:{type:Date,default:Date.now}
});

module.exports=mongoose.model("Task",taskSchema);