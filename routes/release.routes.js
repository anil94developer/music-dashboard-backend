const express = require("express")
const router = express.Router();
const releaseService = require("../services/releaseServices");
const verifyToken = require("../utils/verifyToken");
const multer = require("multer");

// Configure multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); // Ensure the 'uploads' folder exists
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}_${file.originalname}`);
//     },
//   });

//   const upload = multer({ storage });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

const upload = multer({
  storage,
})


// const upload1 = multer({ dest: 'uploads/' }); // Configure the destination folder
const upload1 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Adjust the directory as needed
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
}).array('files');




router.post('/add-one-release', verifyToken, releaseService.addOneRelease)
// router.post('/step-one-release', verifyToken, releaseService.addOneStepRelease)
router.post('/step-one-release', verifyToken, upload.single('coverImage'), async (req, res, next) => {
  try {
    // Attach the file path to req.body
    // if (req.file) {
    //   req.body.coverImage = req.file.path; // Set file path in req.body for access in service
    // }
    console.log("File received:", req.file);
    console.log("Body received:", req.body);

    if (req.file) {
      req.body.coverImage = req.file.path;
    }
    console.log("req.body====", req.body);
    // Call the release service function
    await releaseService.addOneStepRelease(req, res, next);
  } catch (error) {
    console.error("Error in /step-one-release:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});
// router.post('/step-two-release', verifyToken, releaseService.addTwoStepRelease)
router.post('/step-two-release', verifyToken, upload.single('files'), releaseService.addTwoStepRelease);
router.post('/deletefile', verifyToken, releaseService.deleteFile)
router.post('/step-three-release', verifyToken, releaseService.addThreeStepRelease)
router.post('/deleteTrack', verifyToken, releaseService.deleteTrack)
router.post('/step-four-release', verifyToken, releaseService.addFourStepRelease)
router.post('/step-five-release', verifyToken, releaseService.addFiveStepRelease)
router.post('/SubmitFinalRelease', verifyToken, releaseService.SubmitFinalRelease)
router.get('/release-list', verifyToken, releaseService.releaseList)
router.post('/release-delete', verifyToken, releaseService.releaseDelete)
router.post('/release-details', verifyToken, releaseService.releaseDetails)
router.post('/release-update-status', verifyToken, releaseService.updateStatus)
router.post('/tracks-update', verifyToken, releaseService.trackUpdate)
router.get('/tracks-list', verifyToken, releaseService.tracksList)
router.post('/add-label', verifyToken, releaseService.addLabel)
router.get('/label-list', verifyToken, releaseService.labelList)
router.get('/all-draft-list', verifyToken, releaseService.allDraftList)
router.get('/all-release-list', verifyToken, releaseService.allReleaseList)
router.get('/admin-all-release-list', verifyToken, releaseService.adminAllReleaseList)


// router.post('/add-store',verifyToken, releaseService.addStore)
// router.get('/list-store',verifyToken, releaseService.storeList)


module.exports = router 