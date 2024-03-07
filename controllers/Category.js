const Category=require("../models/Category");
const { Mongoose } = require("mongoose");

exports.createCategory=async(req,res)=>{
   try{
    const {name,description}=req.body;

    if(!name || !description){
        return res.status(500).json({
            success:false,
            message:"all field are required",
        })
    }
     console.log("hereeeee");
    const CategorysDetails=await Category.create({
        name:name,
        description:description,
    });

    console.log(CategorysDetails);

    return res.status(200).json({
        status:true,
        message:"categorys created succesfully"
    })


   }
   catch(err){

    return res.status(200).json({
        status:false,
        message:err.message,
    })

   }
};


exports.showAllCategories=async(req,res)=>{
    try{
        console.log("INSIDE SHOW ALL CATEGORIES");
        const allCategorys = await Category.find({});
       return res.status(200).json({
        status:true,
        message:"all Category fetch succesfully",
        data:allCategorys,
       })
    }
    catch(err){
        return res.status(200).json({
            status:false,
            message:err.message,
        })
    }
};


// consider this again and made some changes and make easy

exports.categoryPageDetails = async (req, res) => {
    try {
      const  {categoryId} = req.body
      console.log("writing cateogy id in controller",categoryId)
      console.log("PRINTING CATEGORY ID_________: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
        //   match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
        
      console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }


      





      // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }

      console.log("PRINTING CATEGORY ID____+++++_____: ", categoryId);


      console.log("before different category")
      // Get courses for other categories
      // const categoriesExceptSelected = await Category.find({
      //   _id: { $ne: categoryId },
      // })

      
      // let differentCategory = await Category.findOne(
      //   categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
      //     ._id
      // )
      //   .populate({
      //     path: "courses",
      //   //   match: { status: "Published" },
      //   })
      //   .exec()
      //   console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
    //   const allCategories = await Category.find()
    //     .populate({
    //       path: "courses",
    //       match: { status: "Published" },
    //       populate: {
    //         path: "instructor",
    //     },
    //     })
    //     .exec()
    //   const allCourses = allCategories.flatMap((category) => category.courses)
    //   const mostSellingCourses = allCourses
    //     .sort((a, b) => b.sold - a.sold)
    //     .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          // differentCategory,
        //   mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }