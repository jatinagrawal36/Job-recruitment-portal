const mongoose =require('mongoose');


const JobPostSchema=new mongoose.Schema({
    companyName:{
        type:String,
        required:true
    },
    companyEmail:{
        type:String,
        required:true
    },
    jobName:{
        type:String,
        required:true
    },
    jobRole:{
        type:String,
        required:true
    },
    skillsReq:{
        type:String,
        required:true
    },
    expReq:{
        type:String,
        required:true
    },
    stipend:{
        type:Number,
        required:true
    },
    isOpen:{
        type:Boolean,
        required:true
    }
})

const JobPost = mongoose.model('JobPost',JobPostSchema);

module.exports=JobPost;