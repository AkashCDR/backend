const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },

    otp:{
        type:String,
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
});



async function sendverificationEmail(email,otp){
    try{
       const mailResponse=await mailSender(email,"verification email from StudyNotion",emailTemplate(otp));
       console.log("email sent successfully",mailResponse);
    }
    catch(err){
        console.log("error while sending email,err");
        throw err;
    }
}

OTPSchema.pre("save",async function(next){
    await sendverificationEmail(this.email,this.otp);
    next();
})






module.exports=mongoose.model("OTP",OTPSchema);