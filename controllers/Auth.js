const User=require("../models/User");
const Profile=require("../models/Profile");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
require("dotenv").config();


exports.sendOTP=async(req,res)=>{


try{
    const {email}=req.body;

    const checkUserPresent=await User.findOne({email});

    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'user already registered',
        })
    }

    var otp=otpGenerator.generate(6,{
        lowerCaseAlphabets:false,
        upperCaseAlphabets:false,
        specialChars:false,
    });

    console.log("otp generated",otp);

    let result=await OTP.findOne({otp:otp})
    while(result){
        otp=otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false,
        });
        result=await OTP.findOne({otp:otp});
    }

    const otpPayload={email,otp};
    const otpBody=await OTP.create(otpPayload);
    console.log(otpBody);

    return res.status(201).json({
        success:true,
        message:"otp sent successfully"
    })
    
}
catch(error){
    return res.status(402).json({
        success:false,
        message:"otp not sent",
    })
}


}




exports.signUp=async (req,res)=>{

   
try{
    const {firstName,lastName,email,password,confirmPassword,otp,contactNumber,accountType}=req.body;

    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"all fields are required",
        })
    }

    const existingUser= await User.findOne({email});
    if(existingUser){
        return res.status(404).json({
            success:false,
            message:"account already registered",
        })
    }

    if(password!==confirmPassword){
        return res.status(405).json({
            success:false,
            message:"password not matched",
        })
    }

    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log(recentOtp);


    if(recentOtp.length==0){
        return res.status(406).json({
            success:false,
            message:"otp not found",
        })
    }
   else if(otp !== recentOtp[0].otp){
        return res.status(406).json({
            success:false,
            message:"otp not matched"
        })
    }

    const hashedPassword= await bcrypt.hash(password,10);

    const profileDetails= await Profile.create({
        gender:null,
        dateOfBirth:null,
        contactNumber:null,
        about:null
    })

    const user= await User.create({firstName,
        lastName,
        email,
        password:hashedPassword,
        additionalDetails:profileDetails._id,
        contactNumber,
        accountType,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })

    return res.status(201).json({
        success:true,
        message:"signed up succesfully",
        user,
    })
}
catch(err){
    console.log(err);
 return res.status(400).json({
    success:false,
    message:"please try again, sign-in unsuccesfull",

 })
}




}



exports.login=async (req,res)=>{
    try{
       const {email,password}=req.body;

       if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"all field are required",
        
         })
       }

       const user=await User.findOne({email}).populate("additionalDetails");

       if(!user){
        return res.status(400).json({
            success:false,
            message:"user not registered",
        
         })
       }

       if(await bcrypt.compare(password,user.password)){
        
       const payload={
        email:user.email,
        id:user._id,
        accountType:user.accountType,
       }

       const token=await jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"});

       user.token=token;
       user.password=undefined;

       const options={
        expires:new Date(Date.now() +3*24*60*60*1000),
        httpOnly:true,
       }

       res.cookie("token",token,options).json({
        success:true,
        user,
        token,
        message:"logged in"
       })

       }else{
        return res.status(400).json({
            success:false,
            message:"password not matched",
        
         })
       }


    }
    catch(err){
        return res.status(400).json({
            success:false,
            message:"password incorrect",
        
         })
    }
}





//  TODO: Change password
exports.changePassword=async (req,res)=>{



}