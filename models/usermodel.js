const mongoose=require('mongoose');
const User = new mongoose.Schema({
    name:{type:String, required:true},
    uname:{type:String, required:true, unique:true},
    mobile:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    hospital:{type:String, required:true}
}, {collection:'user-data-endo'}
);
const model=mongoose.model('UserData',User);
module.exports=model;