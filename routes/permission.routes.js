const express = require("express")
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const permission = require("../services/permissionService")
router.post('/add-permission',verifyToken,permission.add);
router.put('/update-permission',verifyToken,permission.update);
router.get("/my-permission",verifyToken,permission.listWithUserDetails)
router.get("/my-user-list",verifyToken,permission.list) 


module.exports = router 