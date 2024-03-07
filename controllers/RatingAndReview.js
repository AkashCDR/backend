const RatingAndReview=require("../models/RatingAndReview");
const Course=require("../models/Course");

exports.createRating = async (req, res) => {
    try{

        //get user id
        const userId = req.user.id;
        
        //fetchdata from req body
        const {rating, review, courseId} = req.body;
        //check if user is enrolled or not
        console.log("i am under creating rating controller",userId)
        console.log("i am under creating rating controller",courseId)
        


        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId} },
                                });

        console.log("i am under creating rating controller",courseDetails)

                                

        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }

        
        


        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        if(alreadyReviewed) {
                    return res.status(403).json({
                        success:false,
                        message:'Course is already reviewed by the user',
                    });
                }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review, 
                                        course:courseId,
                                        user:userId,
                                    });
       
        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                    },
                                    {new: true});
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}



////// RECONSIDER

exports.getAverageRating=async(req,res)=>{
    try{
     const courseId=req.body.courseId;

     const result=await RatingAndReview.aggregate([
        {$match:{course:new mongoose.Types.ObjectId(courseId)}},
        {$group:{_id:null, averageRating:{$avg:"$rating"},}}
     ])

     if(result.length>0){
        return res.status(200).json({
            success:true,
            averageRating:result[0].averageRating,
        })
     }

     return res.status(200).json({
        success:true,
        message:"average rating is 0, no rating given till now",
     })


    }
    catch(err){
      console.log(err);
      return res.sstatus(500).json({
        success:false,
        message:err.message,
      })
    }
}


exports.getAllRating=async(req,res)=>{
    try{
       const allReviews=await RatingAndReview.find({})
                             .sort({rating:"desc"})
                             .populate({
                                path:"user",
                                select:"firstName lastName email image",
                             })
                             .populate({
                                path:"course",
                                select:"courseName",
                             })
                             .exec();


        return res.status(200).json({
          success:true,
          message:"all review fetched succesfully",
          data:allReviews,
        })                   

    }    
    catch(err){
        console.log(err);
        return res.sstatus(500).json({
          success:false,
          message:err.message,
        })
    }
}