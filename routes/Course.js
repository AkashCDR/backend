const express=require("express");
const router=express.Router();

const {
    createCourse,
    // getAllCourses,
    getCourseDetails,
    editCourse,
    getFullCourseDetails,
    getInstructorCourses,
    deleteCourse,
} = require("../controllers/Course");

const {
    showAllCategories,
    createCategory,
    categoryPageDetails,
}=require("../controllers/Category");


// Sections Controllers Import
const {
    createSection,
    updateSection,
    deleteSection,
  } = require("../controllers/Section")
  
  // Sub-Sections Controllers Import
  const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
  } = require("../controllers/subSection")
  
  // Rating Controllers Import
  const {
    createRating,
    getAverageRating,
    getAllRating,
  } = require("../controllers/RatingAndReview")


const {auth , isInstructor,isStudent,isAdmin}=require("../middlewares/auth");




router.post("/createCourse",auth,isInstructor,createCourse);

router.post("/addSection",auth,isInstructor,createSection);

router.post("/updateSection",auth,isInstructor,updateSection);

router.post("/deleteSection",auth,isInstructor,deleteSection);

router.post("/addSubSection",auth,isInstructor,createSubSection);

router.post("/updateSubSection",auth,isInstructor,updateSubSection);

router.post("/deleteSubSection",auth,isInstructor,deleteSubSection);

// router.get("/getAllCourses",getAllCourses);

router.post("/getCourseDetails",getCourseDetails);

router.post("/editCourse",auth,isInstructor,editCourse);

router.delete("/deleteCourse",auth, isInstructor, deleteCourse);





router.post("/createCategory",auth,isAdmin,createCategory);

router.get("/showAllCategories",showAllCategories);

router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

router.post("/getCategoryPageDetails",categoryPageDetails);

router.post("/getFullCourseDetails", auth, getFullCourseDetails)


router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);



module.exports=router;









  
