const mongo=require('mongoose');

const schema=new mongo.Schema({
    name:{
        type:String,
        required:true,
        unique: true,
        mongooseOptions: { sparse: true }
    },
    email:{
        type:String,
        unique: true, 
        required:true
        
    },
    password: {
        type:String,
        unique: true,
        required:true
    },
    subscribed:[String]
})
const Recent3=new mongo.model('Recent3',schema);
module.exports=Recent3; 