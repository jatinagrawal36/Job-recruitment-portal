const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
const path = require('path');
require('./mongo/mongo');
const Dbuser = require('./db/user');
const Dbcompany = require('./db/company');
const Dbjobopen=require('./db/jobpost');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const static_path = __dirname + '/newfile';
const fs = require('fs');
let otp1 = '',otp2;
const port=process.env.PORT ||8000;

const user_home_page = fs.readFileSync(static_path + '/user_home.html', 'utf-8');

app.use(express.static(__dirname));

const companyFile=fs.readFileSync(static_path+'/company_home.html','utf-8');

//for Replacing name in company home page
function replacename(old,Name)
{
    let temp=old.replace('{%name%}',Name);
    return temp;
}

//starting the server
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/newfile/home.html');
})

//otp generation form
function generateotp() {
    otp1 = '';
    let num = '1234567890';
    for (let i = 0; i <= 6; i++) {
        otp1 += num[Math.floor(Math.random() * 10)];
    }
    return otp1;

}
//register company using get method
app.post('/register-done-comp', async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;   
        if (otp2 == otp) {
                const User1 = new Dbcompany({
                    name: name,
                    email: email,
                    password: password,
                    confirm_password: password

                })

                const user2 = await User1.save();
                res.redirect('/company');
            
        }

    }
    catch (err) {
        console.log(err);
    }
})

app.post('/send-otp-comp', async (req, res) => {
    try {
        const pass = req.body.password;
        const confirm = req.body.confirm_password;
         if (pass != confirm) {
            
            return res.send("Plz enter Same password");
        }

        const check = await Dbcompany.findOne({ email: req.body.email },function(err,docs){
        
            if(err)
            {
                return res.send(err);
            }
            if(docs)
            {
             return res.send({msg:"NO"});     
            }
            //console.log(docs.name);
        });
        
        
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true, // true for 465, false for other ports
            auth: {
                user: 'jayeshagrawal197@gmail.com', // generated ethereal user
                pass: 'jatin@124', // generated ethereal password
            },

        });

        otp2 = generateotp();
        // send mail with defined transport object
        let mailOptions = await transporter.sendMail({
            from: '"Otp Confirmation" <jayeshagrawal197@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Otp for Your Registration", // Subject line
            text: `Your otp is ${otp2}`, // plain text body
            // html: "<b>`Your Otp Is ${otp}`</b>", // html body
        });
       
        transporter.sendMail(mailOptions, (err, info) => {

            if (err)
                throw new err;
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            console.log("p");
            return res.send({msg:'otp send to email'});

        });
    }
    
    catch (e) {
        res.send(e);
    }
})

//login compnay get method
app.post('/login-done-comp', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user1 = await Dbcompany.findOne({ email: email });
        if (user1.password == password) {
           
            res.cookie('isLogin', 'true');
            res.cookie('gmail',email);
            res.cookie('CompanyName',user1.name);
            res.redirect('/company');
        }
        else
            res.send("Login Invalid");
    }
    catch (e) {
        res.send("login Invalid");
    }
})

//logout company get method
app.get('/logout-comp', (req, res) => {
    res.cookie('isLogin', false);
    res.clearCookie('gmail');
    res.clearCookie('CompanyName');
    res.clearCookie('isLogin');
    res.redirect('/company');
})

//redirect /company for companies
app.get('/company', (req, res, next) => {
    if (req.cookies!=undefined&&req.cookies.isLogin) {
      
        next();
    }
    else {
        res.sendFile(static_path + '/company.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/company_home.html');
})



app.post('/send-otp-user', async (req, res) => {
    try {
        const pass = req.body.password;
        const confirm = req.body.confirm_password;
         if (pass != confirm) {
            
            return res.send("Plz enter Same password");
        }

        const check = await Dbuser.findOne({ email: req.body.email },function(err,docs){
        
            if(err)
            {
                return res.send(err);
            }
            if(docs)
            {
             return res.send({msg:"NO"});     
            }
            //console.log(docs.name);
        });
        
        
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true, // true for 465, false for other ports
            auth: {
                user: 'jayeshagrawal197@gmail.com', // generated ethereal user
                pass: 'jatin@124', // generated ethereal password
            },

        });

        otp2 = generateotp();
        // send mail with defined transport object
        let mailOptions = await transporter.sendMail({
            from: '"Otp Confirmation" <jayeshagrawal197@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Otp for Your Registration", // Subject line
            text: `Your otp is ${otp2}`, // plain text body
            // html: "<b>`Your Otp Is ${otp}`</b>", // html body
        });
       
        transporter.sendMail(mailOptions, (err, info) => {

            if (err)
                throw new err;
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return res.send({msg:'otp send to email'});

        });
    }
    
    catch (e) {
        res.send(e);
    }
})

//register for user using get method
app.post('/register-done', async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;
        if (otp2 == otp) {
        const user1 = new Dbuser({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            
        })
        const user2 = await user1.save();
        res.redirect('/user');
    }
    else{
    return res.send({msg:"wrong Otp"});
    }

    }
    catch (e) {
        res.send(e);
    }
})


//login of user with get method 
app.post('/login-done', async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const user1 = await Dbuser.findOne({ email: email });

        if (user1.password == password) {
            
            res.cookie('isLogin1', 'true');
            res.cookie('gmail',user1.email);
            res.cookie('UserName',user1.name);
            res.redirect('/user');

        }
        else
            res.send("Login Invalid");
    }
    catch (e) {
        res.send("login Invalid");
    }
})

//redirecting opening page
app.get('/openings', (req, res, next) => {
   

    if (req.cookies.isLogin) { 
       next(); }
    else {
        res.sendFile(static_path + '/company.html');
    }

}, (req, res) => {
    res.sendFile(static_path + '/openings.html');
})


//redirect /user for user 
app.get('/user', (req, res, next) => {
    if (req.cookies!=undefined&& req.cookies.isLogin1) {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/user_home.html');
})

app.get('/logout-user', (req, res) => {
    res.cookie('isLogin1', false);
    res.clearCookie('gmail');
    res.clearCookie('UserName');
    res.clearCookie("isLogin1");
    res.redirect('/user');
    

})


//company_list for user page
app.post('/company-list',(req,res)=>{

    const company_list=Dbcompany.find({},function(err,docs){

        if(err)
        return res.send(err);
        else{
            return res.send({msg:docs});
    }
    })
})


//new Openings Company
app.post('/newopen_comp',async (req,res)=>{
     try{
        const JobNew=new Dbjobopen({

            companyName:req.body.companyname,
            companyEmail:req.body.companyemail,
            jobName:req.body.jobname,
            jobRole:req.body.jobrole,
            expReq:req.body.expreq,
            skillsReq:req.body.skillsrequired,
            stipend:req.body.stipend,
            isOpen:true
            
        })
        const User1=await JobNew.save();
        res.redirect('/company'); 
     }
     catch(err){
         res.send(err);
     }

})


// get data from jobpost database
app.post('/get-opening',(req,res)=>{
   var query=$AND[{companyEmail:req.body.email},{isOpen:true}];
     const Data=Dbjobopen.find(query,function (err, docs) {
        return res.send({msg:docs});
       });
   

})

//subscribe button clicked then gamil added to user database
app.post('/subscribeClick',(req,res)=>{
    const data=Dbcompany.findOne({name:req.body.name1}).exec((err,docs)=>{
        if(err)
        return res.send(err);
        else{
            Dbuser.findOne({ $and:[{ subscribed: docs.email },{email:req.cookies.gmail}]}).exec((err,docs1)=>{
                if(err)
                console.log(err)
                
                if(docs1)
                {

                }
                else
                {
                    const user2=Dbuser.findOneAndUpdate({email:req.cookies.gmail},{$push: { subscribed: docs.email }},function (error, success) {
                        if (error) {
                            console.log(error);
                        }
                        docs.updateOne({$push: { user_subscribed: req.cookies.gmail }},function (error, success) {
                            if (error) {
                                console.log(error);
                            }
                        });   
                    }); 
                    
                }
            })      
        return res.send({msg1:"subscribed"});
    }
    })
})

//unsubscribe button clicked 
app.post('/unsubscribeClick',(req,res)=>{
    const data=Dbcompany.findOne({name:req.body.name1}).exec((err,docs)=>{
        if(err)
        return res.send(err);
        else{
            Dbuser.update( {email:req.cookies.gmail}, { $pull: { subscribed:docs.email } },function (error, success) {
                if (error) {
                    console.log(error);
                }
            });
        return res.send({msg1:"unsubscribed"});
    }
    })
})

//showings opening to developer
app.post('/show-openings',(req,res)=>{
    const user2=Dbuser.findOne({email:req.body.e}).exec((err,docs)=>{
        if(err)
        return res.send(err);
        for(var i=0;i<docs.subscribed.length;i++)
        {
            const msg=Dbjobopen.find({companyEmail:req.body.e}).exec((err,docs1)=>{
               if(err)
                return res.send(err);
            })
            return res.send(msg);
        }
    })
})

//redirect home page for opening in developer page
app.get('/show_opening_user',(req,res,next)=>{

if (req.cookies != undefined && req.cookies.isLogin1 == 'true') {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/show_opening_user.html');
})

//for Show ALL the Opening to user
app.post('/get_all_opening',(req,res)=>{
    
    //console.log(req.body.name);
    const docs=Dbuser.findOne({email:req.body.name}).exec(async (err,docs)=>{
            if(err)
            return res.send(err);
            else if(docs){
               
                if(docs.subscribed.length==0)
                {
                    return res.send({msg:"No Opening"});
            
                }
                let ans=new Array();
                for(i=0;i<docs.subscribed.length;i++)
                {   const docs2= await Dbjobopen.find({ $and:[{ companyEmail: docs.subscribed[i] },{isOpen:true}]},function(err,docs1){
                        if(err)
                        return res.send(err); 
                        }
                    );
                             Array.prototype.push.apply(ans,docs2);
                }
              // console.log(ans);
                return res.send({msg:ans});
            }

    });

})


app.listen(port);
