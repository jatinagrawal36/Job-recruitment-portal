const mongo=require('mongoose');

mongo.connect('mongodb://localhost:27017/form1',{
    useCreateIndex:true,
    useFindAndModify:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connected");
}).catch((err)=>{
   // console.log(e);
    console.log(err);
})  

