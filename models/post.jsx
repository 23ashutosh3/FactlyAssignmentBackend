const mongoose = require("mongoose");
const userSchema=new mongoose.Schema({
	post:{type:String,required:true,},
	author:{type:String,required:true},
	categories:{type:String,required:true}

});

module.exports=Post=mongoose.model("post" ,userSchema);
