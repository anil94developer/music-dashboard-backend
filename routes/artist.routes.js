const express = require("express")
const router = express.Router();
const artistService = require("../services/artistService"); 
const verifyToken = require("../utils/verifyToken");

router.post('/add-artist',verifyToken, artistService.addArtist)
router.get('/artist-list',verifyToken, artistService.artistList)

module.exports = router 