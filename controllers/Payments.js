// const {instance}=require("../config/razorpay");
// const User=require("../models/User");
// const mailSender=require("../utils/mailSender");
// const Course=require("../models/Course");
// const {default:mongoose}=require("mongoose");




// exports.capturePayment=async(req,res)=>{
//     const {course_id}=req.body;
//     const {userId}=req.user.id

//     if(!course_id){
//         return res.status(400).json({
//             success:false,
//             message:"please choose valid course",
//         })
//     }
//     let course;
//     try{
//      course=await Course.findOne(course_id);
//      if(!course){
//         return res.status(400).json({
//             success:false,
//             message:"this course is not found",
//         })
//      }

//      const uid=new mongoose.Types.ObjectId(userId);
//      if(course.studentsEnrolled.includes(uid)){
//         return res.status(400).json({
//             success:false,
//             message:"student is already enrolled",
//         })
//      }


//     }
//     catch(err){
//         return res.status(402).json({
//             success:false,
//             message:err.message,
//         })
//     }

//     const amount=course.price;
//     const currency="INR";

//     const options={
//         amount:amount*100,
//         currency,
//         recipt:Math.random(Date.now()).toString(),
//         notes:{
//             courseId:course_id,
//             userId
//         }
//     }

//     try{

//        const paymentResponse=await instance.orders.create(options);
//        console.log(paymentResponse);

//        return res.status(200).json({
//         success:true,
//         courseName:course.courseName,
//         courseDescription:course.courseDescription,
//         thumbnail:course.thumbnail,
//         orderId:paymentResponse.id,
//         currency:paymentResponse.currency,
//         amount:paymentResponse.amount,

//        })

//     }
//     catch(err){
//       console.log(err);
//       return res.status(400).json({
//         success:false,
//         message:"could not initiate order"
//       })
//     }



// }


// exports.verifySignature=async(req,res)=>{
//     const webhookSecret="12345678";

//     const signature=req.headers("x-razorpay-signature");
//     const shasum=crypto.createHmac("sha256",webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest=shasum.digest("hex");

//     if(signature==digest){
//      console.log("payment is authorized");

//      const {userId,courseId}=req.body.payload.payment.entity.notes;


// try{
     

//     const enrolledCourse= await Course.findByIdAndUpdate(
//         {_id:courseId},
//         {$push:{studentsEnrolled:userId}},
//         {new:true},
//      )

//      if(!enrolledCourse){
//         return res.status(400).json({
//             success:false,
//             message:"course not found",
//         })
//      }


//      console.log(enrolledCourse);


  
//      const enrolledUser= await User.findByIdAndUpdate(
//         {_id:userId},
//         {$push:{courses:courseId}},
//         {new:true},
//      )


//      console.log(enrolledUser);


//      const emailResponse=await mailSender(
//                              enrolledUser.email,
//                              "congratulations from codehelp",
//                              "congratulation you are onboarded into a new course of codehelp"
//      )

//      console.log(emailResponse);

//      return res.status(200).json({
//         success:true,
//         message:"signature verified and course added",
//      })


// }
// catch(err){

// console.log(err);
// return res.status(404).json({
//     success:false,
//     message:err.message,
// })

// }

//     }
//     else{
// return res.status(400).json({
//     success:false,
//     message:"Invalid Request",
// })
//     }



// }


const { instance } = require("../config/razorpay")

const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)
      console.log("course____id",course_id)
      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)

      console.log("___uid",uid)
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      

      // Add the price of the course to the total amount
      total_amount += course.price

      console.log("total_____amount",total_amount)

      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }
  console.log("payment is here after option create",options)
  try {
    // Initiate the payment using Razorpay
    console.log("Initiate the payment using Razorpay")
    const paymentResponse = await instance.orders.create(options)
    console.log("printing payment response in capture payment",paymentResponse)
    res.json({
      success: true,
      message: paymentResponse,
    })
  } catch (error) {
    console.log("error occured in capture payment section")
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  console.log("razorpay_order_id",razorpay_order_id)
  console.log("razorpay_payment_id",razorpay_payment_id)
  console.log("razorpay_signature",razorpay_signature)
  console.log("courses",courses)
  console.log("userId",userId)
  

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", `A9Jk9L4CiZFwu989WHAzMxJy`)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

















// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

    //   const courseProgress = await CourseProgress.create({
    //     courseID: courseId,
    //     userId: userId,
    //     completedVideos: [],
    //   })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            // courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}