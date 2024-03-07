const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto=require("crypto");



////// RECONSIDER


exports.resetPasswordToken=async(req,res)=>{

try{
    const email = req.body.email;
    const user = await User.findOne({ email: email });

if(!user){
    return res.status(401).json({
        success:false,
        message:"your email is not registered with us",
    })
}

const token=crypto.randomBytes(20).toString("hex");;

const updatedDetails=await User.findOneAndUpdate({email:email},
    {
        token:token,
        resetPasswordExpires:Date.now() + 5*60*1000,
    },{new:true});

    const url= `https://localhost:3000/update-password/${token}`

    await mailSender(email,"password Reset Link",`password reset link: ${url}`);

    return res.status(200).json({
        success:true,
        message:"message sent succesfully, please change your password",
    })
}
catch(err){
    return res.status(500).json({
        success:false,
        message:"something went wrong while reseting password"
    })
}


}


exports.resetPassword=async(req,res)=>{
    try{
     const {password,confirmPassword,token}=req.body;
     if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"password is not matching"
        })
     }

     const userDetails=await User.findOne({token:token});

     if(!userDetails){
        return res.status(400).json({
            success:false,
            message:"user not found",
        })
     }

     if(userDetails.resetPasswordExpires<Date.now()){
        return res.status(400).json({
            success:false,
            message:"token expires",
        })
     }

     const hashedPassword=await bcrypt.hash(password,10);

     await User.findOneAndUpdate(
     {token:token},
     {password:hashedPassword},
     {new:true},
        );

        return res.status(200).json({
            success:true,
            message:"password reset succesfully"
        })
  

    }
    catch(err){
         return res.status(400).json({
            success:false,
            message:"something went wrong while reseting password and sending mail",
         })
    }
}