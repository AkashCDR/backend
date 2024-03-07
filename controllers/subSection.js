const SubSection=require("../models/SubSection");
const Section=require("../models/Section");
const {uploadImageToCloudinary}=require("../utils/imageUploader");




///// RECONSIDER FULL



exports.createSubSection=async(req,res)=>{
    try{
     
     const {sectionId,title,description}=req.body;
     const video=req.files.video;
     
     console.log(sectionId);
     console.log(title);
     console.log(description);
     console.log(video);
     
     
     if(!sectionId || !title  || !description || !video){
        return res.status(404).json({
            success:false,
            message:"all fields are required",
        })
     }

     const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

     const SubSectionDetails= await SubSection.create({
        title:title,
        timeDuration:`${uploadDetails.duration}`,
        description:description,
        videoUrl:uploadDetails.secure_url,
     })


    //  const updateSection= await Section.findByIdAndUpdate({_id:sectionId},
    //     {
    //         $push:{
    //             subSection:SubSection._id,
    //         }
    //     }
    //     ).populate("subSection")


    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")





       return res.status(200).json({
        success:true,
        message:"subsection created succesfully",
        data:updatedSection
       })


    }
    catch(err){
      return res.status(500).json({
        success:false,
        message:"internal server error",
      })
    }
}               




//  TODO: UPDATE SECTION 

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}














// exports.deleteSubSection=async(req,res)=>{
//   try{
// const {subSectionId,sectionId}=req.body;

// await Section.findByIdAndDelete({_id:sectionId},
//   {
//     $pull:{subSection:subSectionId}
//   },
//   )

//   const subSection=await SubSection.findByIdAndDelete({_id:subSectionId});


//   if(!subSection){
//     return res.status(404).json({
//       success:false,
//       message:"subsection not found,"
//     })
//   }

// const updatedSection=await Section.findById(sectionId).populate("subSection");

// return res.status(200).json({
//   success:true,
//   message:"subsection deleted succesfully",
//   data:updatedSection,
// })

//   }
//   catch(err){
// return res.status(404).json({
//   success:false,
//   message:"probelm created during creating subsections",
// })
//   }
// }

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}