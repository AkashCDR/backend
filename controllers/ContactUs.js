const {contactUsEmail}=require("../mail/templates/contactFormRes");
const mailSender=require("../utils/mailSender");

exports.contactUsController=async(req,res)=>{
    const {email,firstname,lastname,message,phoneNo,countrycode}=req.body;

    console.log(req.body);

    try{
      const emailRes=await mailSender(email,
        "your data send successfully",
        contactUsEmail(email,firstname,lastname,message,phoneNo,countrycode)
        )
        console.log("Email Res ",emailRes);
        return res.json({
            success:true,
            message:"email send successfully",
        })
    }
    catch(err){
       console.log("error",err);
       console.log("error message",err.message);
       return res.json({
        success:false,
        message:"something went wrong...",
       })
    }
}