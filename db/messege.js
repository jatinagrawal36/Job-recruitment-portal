const mongo=require('mongoose');
const Schema=new mongo.Schema({
    sender_name:{
        type:String
    },
    sender_msg:{
        type:String
    },
    date_time:{
        type:Date,
        default:Date.now
    }
    
})
const Messege=new mongo.model('Messege',Schema);
module.exports=Messege;