const router= require('express').Router();
const User= require("../models/user");
const bcrypt= require("bcrypt");

router.get('/',(req,res)=>{
    res.send("Auth Route");
});


router.post("/register",async(req,res)=>{

    
    try{
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(req.body.password,salt);
        const appUser= new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email
        });
        const userData=await appUser.save();
        res.status(200).json(userData);
    }catch(err){
        console.log(err);
    }
   

});


router.post("/login",async (req,res)=>{

    try{

    }catch(err){
        console.log(err);
    }

});

module.exports=router;