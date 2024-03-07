const Course=require("../models/Course");
const Section=require("../models/Section");
const SubSection = require("../models/SubSection");

exports.createSection=async(req,res)=>{

   try{
      const {sectionName,courseId}=req.body;
    if(!sectionName || !courseId){
        return res.status(400).json({
            success:false,
            message:"missing properties",
        })
    }
    

    const newSection=await Section.create({sectionName});


    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
            $push: {
                courseContent: newSection._id,
            },
        },
        { new: true }
    )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

    return res.status(200).json({
        success:true,
        message:"section created succesfully",
        updatedCourse
    })
   
   }
   catch(err){
      return res.status(400).json({
        success:false,
      message:"problem arises during creating section",
      error:err.message
      })
   }


}


exports.updateSection=async(req,res)=>{
    try{
       const {sectionName,sectionId,courseId}=req.body;


       if(!sectionName || !sectionId){
        return res.status(400).json({
            success:false,
            message:"missing properties",
        })
    }

    const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});


    const course = await Course.findById(courseId)
    .populate({
        path:"courseContent",
        populate:{
            path:"subSection",
        },
    })
    .exec();




    return res.status(200).json({
        success:true,
        message:"section update succesfully",
        data:course,
    })

    }
    catch(err){
        return res.status(400).json({
            success:false,
          message:"problem arises during updating section",
          error:err.message
          })
    }
}




////// RECONSIDERR

exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   