const mongo=require('mongoose');

const schema=new mongo.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },

    bio:{
        type:String,
        required:true
    },

    skills:[String],

    experience:{
        type:String,
        required:true
    },

    college:{
        type:String,
        requied:true
    },

    degree:{
        type:String,
        required:true
    },

    lastJob:{
        type:String,
        required:true
    },

    date:{
      type:Date,
      default:Date.now
    }
})
const Portforlio=new mongo.model('Portfolio',schema);
module.exports=Portforlio;