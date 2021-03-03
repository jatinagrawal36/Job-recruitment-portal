const mongo=require('mongoose');

const schema=new mongo.Schema({
    name:{
        type:String,
        isRequired:true,
        isUnique: true,
        mongooseOptions: { sparse: true }
    },
    email:{
        type:String,
        Unique: true, 
        Required:true
        
    },
    password: {
        type:String,
        Unique: true,
        Required:true
    },
    confirm_password:{
        type:String,
        isUnique: true,
        isRequired:true

    },
    user_subscribed:[String]
}) 
const Recent1=new mongo.model('Recent1',schema);
module.exports=Recent1;

