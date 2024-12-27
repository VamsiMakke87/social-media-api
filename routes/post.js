const router= require('express').Router();
const Post=require('../models/post');

// Create a post
router.post("/", async (req,res)=>{

    const newPost= new Post(req.body);

    try{
        const post= await newPost.save();
        res.status(200).json("Posted Sucessfully");

    }catch(err){
        res.status(500).json(err);
    }

});




module.exports=router;