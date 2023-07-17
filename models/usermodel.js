const mongoose=require('mongoose');
const User = new mongoose.Schema({
    name:{type:String, required:true},
    uname:{type:String, required:true, unique:true},
    mobile:{type:String, unique:true},
    password:{type:String, required:true},
    hospital:{type:String, required:true},
    email:{type:String, unique:true}
}, {collection:'user-data-endo'}
);
const model=mongoose.model('UserData',User);
module.exports=model;