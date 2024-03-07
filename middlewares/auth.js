const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

exports.auth=async (req,res,next)=>{
    try{
     const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

     if(!token){
        return res.status(401).json({
            success:false,
            message:"token not found"
        })
     }

     try{
      const decode= jwt.verify(token,process.env.JWT_SECRET);
      console.log(decode);
      req.user=decode;
     }
     catch(err){
        return res.status(400).json({
            success:false,
            message:"token invalid",
        
         })
     }

next();
    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            success:false,
            message:"token verification failed",
        
         })
    }
}


exports.isStudent=async(req,res,next)=>{
    try{
      if(req.user.accountType!=="Student"){
       return res.status(400).json({
        success:false,
        message:"this is protected route for student only",
       })
      }
      next();
    }
    catch{
        return res.status(400).json({
            success:false,
            message:"user role can not be verified please try again",
           })
    }
}




exports.isInstructor=async(req,res,next)=>{
    try{
      if(req.user.accountType!=="Instructor"){
       return res.status(400).json({
        success:false,
        message:"this is protected route for Instructor only",
       })
      }
      next();
    }
    catch{
        return res.status(400).json({
            success:false,
            message:"user role can not be verified please try again",
           })
    }
}





exports.isAdmin=async(req,res,next)=>{
    try{
      if(req.user.accountType!=="Admin"){
       return res.status(400).json({
        success:false,
        message:"this is protected route for Admin only",
       })
      }
      next();
    }
    catch{
        return res.status(400).json({
            success:false,
            message:"user role can not be verified please try again",
           })
    }
}