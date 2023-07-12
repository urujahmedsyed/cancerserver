const mongoose=require("mongoose");

const userDetailsSchema=new mongoose.Schema(
    {
        name:String,
        uname:String,
        mobile:String,
        password:String
    },{
        collection:"UserInfo",
    }
);
+
mongoose.model("UserInfo",userDetailsSchema);