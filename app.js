const express = require('express');
const app = express();
const http=require('http').createServer(app);
const fetch= require('node-fetch');

const io=require('socket.io')(http);
const nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
const path = require('path');
require('./mongo/mongo');
const Dbuser = require('./db/user');
const Dbcompany = require('./db/company');
const Dbjobopen = require('./db/jobpost');
const Dbportfolio = require('./db/portfolio')
const Dbmessege=require('./db/messege');

const body_parser = require('body-parser');
app.use(cookieParser());
app.use(express.json());
app.use(body_parser.json());

app.use(express.urlencoded({ extended: false }));
const static_path = __dirname + '/newfile';
const static_path1 = __dirname;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const fs = require('fs');
var obj1;
fs.readFile(`${__dirname}/api/api.json`,'utf-8',async (err,data)=>{
   obj1=await JSON.parse(data);
});


const { Db } = require('mongodb');
const { json } = require('body-parser');
const { findOne } = require('./db/jobpost');
let otp1 = '', otp2;
const port = process.env.PORT || 8000;

const user_home_page = fs.readFileSync(static_path + '/user_home.html', 'utf-8');

app.use(express.static(__dirname));

const companyFile = fs.readFileSync(static_path + '/company_home.html', 'utf-8');

//for Replacing name in company home page
function replacename(old, Name) {
    let temp = old.replace('{%name%}', Name);
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

        const check = await Dbcompany.findOne({ email: req.body.email }).exec(async (err,docs)=> {

            if (err) {
                return res.send(err);
            }
            if (docs) {
                return res.send({ msg: "NO" });
            }
            else
            {
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true, // true for 465, false for other ports
                    auth: {
                        user: 'yourusername@gmail.com', // generated ethereal user
                        pass: 'YourPassword', // generated ethereal password
                    },
        
                });
        
                otp2 = generateotp();
                // send mail with defined transport object
                let mailOptions = await transporter.sendMail({
                    from: '"Otp Confirmation" <yourusername@gmail.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: "Otp for Your Registration", // Subject line
                    text: `Your otp is ${otp2}`, // plain text body
                    // html: "<b>`Your Otp Is ${otp}`</b>", // html body
                });
        
                transporter.sendMail(mailOptions, (err, info) => {
        
                    if (err)
                        throw new err;
                    return res.send({ msg: 'otp send to email' });
        
                });
            }
            //console.log(docs.name);
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
            /*if(req.cookies!=undefined)
            {
                res.clearCookie(isLogin1);
                res.clearCookie(gmail);
                res.clearCookie(UserName);
            }*/
            res.cookie('isLogin', 'true');
            res.cookie('gmail_comp', email);
            res.cookie('CompanyName', user1.name);
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
    res.clearCookie('gmail_comp');
    res.clearCookie('CompanyName');
    res.clearCookie('isLogin');
    res.redirect('/company');
})

//redirect /company for companies
app.get('/company', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin) {

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
        const check = await Dbuser.findOne({ email: req.body.email }).exec( async (err, docs) =>{
            if (err) {
                return res.send(err);
            }
            else if (docs) {
                return res.send({ msg: "NO" });
            }
            else
            {
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'yourusername@gmail.com', // generated ethereal user
                        pass: 'YourPassword', // generated ethereal password
                    },
        
                });
        
                otp2 = generateotp();
                // send mail with defined transport object
                let mailOptions = await transporter.sendMail({
                    from: '"Otp Confirmation" <yourusername@gmail.com>', // sender address
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
                    return res.send({ msg: 'otp send to email' });
        
                });
            }
            //console.log(docs.name);
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
        else {
            return res.send({ msg: "wrong Otp" });
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

            /* if(req.cookies!=undefined)
             {
                 res.clearCookie(isLogin);
                 res.clearCookie(gmail_comp);
                 res. clearCookie(CompanyName);    
             }*/
            res.cookie('isLogin1', 'true');
            res.cookie('gmail', user1.email);
            res.cookie('UserName', user1.name);
             if(!(user1.isFirsttime))
            {
                await Dbuser.update({email:email},{date:Date.now}).exec((err,success)=>{
                    if(err)
                    {
                        res.send(err);
                    }
                })
                res.redirect('/question');
            }
            else
            {
            res.redirect('/user');
            }

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
        next();
    }
    else {
        res.sendFile(static_path + '/company.html');
    }

}, (req, res) => {
    res.sendFile(static_path + '/openings.html');
})


//redirect /user for user 
app.get('/user', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin1) {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, async (req, res) => {
    res.sendFile(static_path + '/user_home.html');
})

//logout user
app.get('/logout-user', (req, res) => {
    res.cookie('isLogin1', false);
    res.clearCookie('gmail');
    res.clearCookie('UserName');
    res.clearCookie("isLogin1");
    res.redirect('/user');
})

//redirect for question paper
app.get('/question',(req,res,next)=>{
    if(req.cookies!=undefined&&req.cookies.isLogin1)
    {
        next();
    }
    else
    res.sendFile(static_path+'/user.html');
},async (req,res)=>{
    const user1=await Dbuser.findOne({email:req.cookies.gmail});

        if(user1&&user1.isFirsttime==false)
        res.sendFile(static_path+'/quiz.html');
        else
        res.redirect('/user');
        
})

//Post method for response all the questions
app.post('/get_questions',(req,res)=>{
    var obj;
    fs.readFile(`${__dirname}/api/api.json`,'utf-8',(err,data)=>{
        obj=JSON.parse(data);
        return res.send({msg:obj.results});
    })
})


//company_list for user page
app.post('/company-list', (req, res) => {

    const company_list = Dbcompany.find({}, function (err, docs) {

        if (err)
            return res.send(err);
        else {
            return res.send({ msg: docs });
        }
    })
})


//new Openings Company
app.post('/newopen_comp', async (req, res) => {
    try {
        const JobNew = new Dbjobopen({

            companyName: req.body.companyname,
            companyEmail: req.body.companyemail,
            jobName: req.body.jobname,
            jobRole: req.body.jobrole,
            expReq: req.body.expreq,
            skillsReq: req.body.skillsrequired,
            stipend: req.body.stipend,
            isOpen: true

        })
        const User1 = await JobNew.save();
        res.redirect('/company');
    }
    catch (err) {
        res.send(err);
    }

})


// get data from jobpost database for company home page
app.post('/get-opening_comp', (req, res) => {

    const Data = Dbjobopen.find({ companyEmail: req.body.email }, function (err, docs) {
        return res.send({ msg: docs });
    });

})

//subscribe button clicked then gamil added to user database
app.post('/subscribeClick', (req, res) => {
    const data = Dbcompany.findOne({ name: req.body.name1 }).exec((err, docs) => {
        if (err)
            return res.send(err);
        else {
            Dbuser.findOne({ $and: [{ subscribed: docs.email }, { email: req.cookies.gmail }] }).exec((err, docs1) => {
                if (err)
                    console.log(err)

                if (docs1) {

                }
                else {
                    const user2 = Dbuser.findOneAndUpdate({ email: req.cookies.gmail }, { $push: { subscribed: docs.email } }, function (error, success) {
                        if (error) {
                            console.log(error);
                        }
                        docs.updateOne({ $push: { user_subscribed: req.cookies.gmail } }, function (error, success) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });

                }
            })
            return res.send({ msg1: "subscribed" });
        }
    })
})

//unsubscribe button clicked 
app.post('/unsubscribeClick', (req, res) => {
    const data = Dbcompany.findOne({ name: req.body.name1 }).exec((err, docs) => {
        if (err)
            return res.send(err);
        else {
            Dbuser.update({ email: req.cookies.gmail }, { $pull: { subscribed: docs.email } }, function (error, success) {
                if (error) {
                    console.log(error);
                }
                docs.updateOne({ $pull: { user_subscribed: req.cookies.gmail } }, function (error, success) {
                    if (error) {
                        console.log(error);
                    }
                });
            });
            return res.send({ msg1: "unsubscribed" });
        }
    })
})

//showings opening to developer
app.post('/show-openings', (req, res) => {
    const user2 = Dbuser.findOne({ email: req.body.e }).exec((err, docs) => {
        if (err)
            return res.send(err);
        for (var i = 0; i < docs.subscribed.length; i++) {
            const msg = Dbjobopen.find({ companyEmail: req.body.e }).exec((err, docs1) => {
                if (err)
                    return res.send(err);
            })
            return res.send(msg);
        }
    })
})

//redirect home page for opening in developer page
app.get('/show_opening_user', (req, res, next) => {

    if (req.cookies != undefined && req.cookies.isLogin1 == 'true') {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/show_opening_user.html');
})

//show all total opening to user
app.get('/show_total_opening_user', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin1 == 'true') {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/show_total_opening_user.html');
})

//for Show ALL the Opening to user
app.post('/get_subscribed_opening', (req, res) => {
    
    const docs = Dbuser.findOne({ email: req.body.name }).exec(async (err, docs) => {
        if (err)
            return res.send(err);
        else if (docs) {
            let ans = new Array();
            if (docs.subscribed.length == 0) {
                return res.send({ msg: "No Opening" });
            }
            for (i = 0; i < docs.subscribed.length; i++) {
                const docs2 = await Dbjobopen.find({ $and: [{ companyEmail: docs.subscribed[i] }, { isOpen: true }] }, function (err, docs1) {
                    if (err)
                        return res.send(err);
                }
                );
                Array.prototype.push.apply(ans, docs2);
            }
            // console.log(ans);
            return res.send({ msg: ans });
        }

    });

})
app.post('/get_all_opening', (req, res) => {
    const docs = Dbjobopen.find({}).exec((err, docs) => {
        if (err)
            return res.send(err);
        else if (docs) {
            return res.send({ msg: docs });
        }

    });

})


// get subscribed comapny of user
app.post('/get_subscribed', (req, res) => {
    Dbuser.findOne({ email: req.body.e }).exec(async (err, docs) => {
        if (err)
            return res.send(err);
            if(docs)
            {
        return res.send({ totalsubscribed1: await docs.subscribed });
            }
    })
});

// open portfolio of user
app.get('/portfolio', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin1 == 'true') {
        next();
    }
    else {
        res.sendFile(static_path + '/user.html');
    }
}, (req, res) => {
    res.sendFile(static_path + '/portfolio.html');
})

//portfolio updated/submitted of user
app.post('/portfolio_submit', (req, res) => {
    try {
        Dbportfolio.findOne({ name: req.cookies.UserName }).exec(async (err, docs) => {
            if (err)
                res.send(err);
            if (docs) {
                Dbportfolio.updateMany({ name: req.cookies.UserName }, {
                    $set: {
                        name: req.cookies.UserName,
                        email: req.body.email,
                        bio: req.body.bio,
                        experience: req.body.experience,
                        college: req.body.college,
                        degree: req.body.degree,
                        lastJob: req.body.last_job,
                        skills: [req.body.skill_1, req.body.skill_2, req.body.skill_3]
                    }
                }, function (error, success) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
            else {
                const Portfolio1 = new Dbportfolio({
                    name: req.cookies.UserName,
                    email: req.body.email,
                    bio: req.body.bio,
                    experience: req.body.experience,
                    college: req.body.college,
                    degree: req.body.degree,
                    lastJob: req.body.last_job,
                    skills: [req.body.skill_1, req.body.skill_2, req.body.skill_3]
                });
                const Portfolio2 = await Portfolio1.save();
            }
        })

        res.redirect('/user');
    }
    catch (e) {
        return res.send(e);
    }
})

//for closing that opening
app.post('/close_opening', (req, res) => {
    Dbjobopen.updateOne({ $and: [{ _id: req.body.id }] }, { isOpen: false }, function (err, sucess) {
        if (err)
            return res.send(err);
        else
            return res.send({ msg1: 'closed' });
    })
})

//for checking the opening
app.post('/check_opening', (req, res) => {
    Dbjobopen.findOne({ $and: [{ _id: req.body.id }] }).exec((err, sucess) => {
        if (err)
            return res.send(err);
        if (sucess)
            return res.send({ msg2: sucess.isOpen });
        else
            return res.send({ msg2: "NOT FOUND" });
    })
})



//User apply for a job
app.post('/apply_job_user', (req, res) => {
    Dbjobopen.updateOne({ $and: [{ _id: req.body.id }] }
        , { $push: { appliedDev: req.cookies.gmail } }).exec((err, suc) => {
            if (err)
                return res.send(err);
            else
                return res.send({ msg: 'applied' });
        });
})

//Applied devs list 
app.post('/see_appliedDev', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin) {
        next();
    }
    else
        res.sendFile(static_path + '/company.html');
}, (req, res) => {
    res.sendFile(static_path + '/see_appliedDev.html');
})


//User can see their status for which they applied
app.get('/status_user', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin1) {
        next();
    }
    else
        res.sendFile(static_path + '/user.html');
}, (req, res) => {
    res.sendFile(static_path + '/status_user.html');

})

//list of all applied company by user
app.post('/all_appliedcomp_user', (req, res) => {
    const allcomp = Dbjobopen.find({ appliedDev: req.body.e }).exec(async (err, docs) => {
        if (err)
            return res.send(err);
        else
            return res.send({ msg: await docs });
    })
})

//list of All Applied Users for company
app.post('/get_allapplieduser_comp', (req, res) => {
    const alluser = Dbjobopen.find({ companyEmail: req.body.e }).exec(async (err, docs) => {
        if (err)
            return res.send(err);
        else
            return res.send({ msg: await docs });
    })

})

//find username from their mail who applied for job
app.post('/find_useremail_appliedDev', (req, res) => {
    Dbuser.findOne({ email: req.body.user_email }).exec((err, docs) => {
        if (err)
            return res.send(err);
        else
            return res.send({ msg1: docs });
    })
})

//accept the request of user by company
app.post('/accepted_request', (req, res) => {
    Dbjobopen.findOneAndUpdate({ $and: [{ _id: req.body.id }] }, { $push: { accepted: req.body.email } }).exec((err, docs) => {
        if (err)
            return res.send(err);
        else
            return res.send({ msg2: "P" });
    })
})

//Reject the dev request for that job
app.post('/rejected_request', (req, res) => {
    Dbjobopen.findOneAndUpdate({ $and: [{ _id: req.body.id }] }, { $push: { rejected: req.body.email } }).exec((err, docs) => {
        if (err)
            return res.send(err);
        else
            return res.send({ msg2: "P" });
    })
})
app.post('/load_portfolio', (req, res) => {
    console.log(req.body.data);
    
});
//Redirecting the page of showing portfolio
app.post('/show_portfolio_appliedDev', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin) {
        next();
    }
    else
        res.sendFile(static_path + '/company.html');
}, async (req, res) => {
    console.log(req.body);
    const docs = await Dbportfolio.findOne({ email: req.body["email"] }, function (err, docs) {
        if (err)
            res.send(err);
            var data = {name: docs.name,
                email: docs.email,
                bio: docs.bio,
                experience: docs.experience,
                college: docs.college,
                degree: docs.degree,
                last_job: docs.lastJob,
                skill_1: docs.skills[0],
                skill_2: docs.skills[1],
                skill_3: docs.skills[2]}
            res.render('portfolio1',data);
        });
    
})

//redirect notification to user
app.get('/notification_user', (req, res, next) => {
    if (req.cookies != undefined && req.cookies.isLogin1) {
        next();
    }
    else
        res.sendFile(static_path + '/user.html');
}, (req, res) => {
    res.sendFile(static_path + '/notifications.html');

})

//check either portfolio exist or not
app.post('/portfolio_find_user', (req, res) => {
    Dbportfolio.findOne({ email: req.body.e }).exec(async (err, docs) => {
        if (err)
            return res.send(err);
        if (docs) {
            return res.send({ msg6: 1 });
        }
        else
            return res.send({ msg6: 0 });
    })
})

//Check total answer and store in database
app.post("/question_to_userhome",async (req,res)=>{

    const user1=await Dbuser.findOne({email:req.cookies.gmail});
     if(user1&&user1.isFirsttime==false)
     {
    var p=0; 
    for(var i=0;i<10;i++)
        {
            var st=req.body["question"+i];
            
            if(st=="0")
            {
                p++;
            }
        }
        await Dbuser.updateMany({email:req.cookies.gmail},{$set:{hiddenScore:p,isFirsttime:true}}).exec((err,docs)=>{
            if(err)
            res.send(err);
        });
        res.redirect('/user');
    }
    else            
        res.redirect('/user');
})

//for Get the remain time of quiz
app.post('/get_timeremaining_quiz',async (req,res)=>{
    const user1=await Dbuser.findOne({email:req.body.e1});
    return res.send({msg:user1.loginTime});
})

//for chat portal
app.get('/chat_portal_user',(req,res,next)=>{
    if(req.cookies!=undefined&&req.cookies.isLogin1)
    {
        next();
    }
    else
    res.sendFile(static_path+'/user.html');

},(req,res)=>{
    res.sendFile(static_path+'/message.html');
})

//For socketing
const user_id={};
io.on('connection',(socket)=>{
    
    socket.on('user-connected',async (e1)=>{
        
        user_id[socket.id]=e1;
        await Dbmessege.find().sort({date_time: 1}).exec((err, cursor)=>{
            if(err)
            throw new Error(err);
        });
        const user1=await Dbmessege.find({},function(err,docs){
            if(err)
            throw new Error(err);
        });
        socket.emit('new_user_connected',user1);

    })
    socket.on('send',async (data)=>{
        const user1=await Dbmessege.create({sender_name:data.name,sender_msg:data.msg,date_time:Date.Now},function(err,docs){
            if(err)
            {
                throw new Error(err);
            }
        });
        socket.broadcast.emit('received',{msg:data.msg,name:data.name});
    })
})
//for Creating test for user
app.post('/create_test',(req,res,next)=>{
   
    if(req.cookies!=undefined&&req.cookies.isLogin)
    {
        next();
    }
    else
    res.sendFile(static_path+'/company.html');

},async (req,res)=>{
    var all_user="";
   // console.log(req.body["company_job_id"]);
    const user1=await Dbjobopen.findOne({_id:req.body["company_job_id"]},function(err,docs){
        if(err)
        res.send(err);
       // console.log("p");
    });
  // console.log(user1);
    for(var i=0;i<user1.accepted.length;i++)
    {
        all_user=all_user+user1.accepted[i];
        if(i<user1.accepted.length-1)
        {
            all_user=all_user+" , ";
        }
    }
    res.render('create_test',{accepted_name:all_user,id:req.body["company_job_id"]});
})
//for sending link mail to all applied dev 
app.post('/send_test_email',async (req,res,next)=>{
    if(req.cookies!=undefined&&req.cookies.isLogin)
    {
        next();
    }
    else
    res.sendFile(static_path+'/company.html');

},async (req,res)=>{
    
    const user1=await Dbjobopen.findOne({_id:req.body.hidden},function(err,docs){
        if(err)
        res.send(err);
    })
    for(var i=0;i<user1.accepted.length;i++)
    {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true, // true for 465, false for other ports
            auth: {
                user: 'yourusername@gmail.com', // generated ethereal user
                pass: 'YourPassword', // generated ethereal password
            },

        });

        // send mail with defined transport object
        let mailOptions = await transporter.sendMail({
            from: 'ALERT FROM '+user1.companyName+' <yourusername@gmail.com>', // sender address
            to: user1.accepted[i], // list of receivers
            subject: 'TEST LINK', // Subject line
            text: 'TEST LINK FOR '+user1.companyName+' FOR '+user1.jobName+' is', // plain text body
             html: '<h2>TEST LINK</h2><a href='+req.body.link+'>'+req.body.link+'</a><br><h1>GOOD LUCK GUYS</h1>', // html body
        });
        transporter.sendMail(mailOptions, (err, info) => {

            if (err)
                throw new err;

        });
    }
    res.redirect('/company');

    
})

http.listen(port);