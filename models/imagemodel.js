const mongoose=require('mongoose');
const User = new mongoose.Schema({
    image:{type:Buffer, required:true},
    result:{type:String, required:true},
    ground:{type:String, required:true},
    username:{type:String, required:true},
    type:{type:String, required:true},
}, {collection:'user-data'}
);
const model=mongoose.model('Img',User,'imgs');
module.exports=model;