const express = require('express');
const router = express.Router();
const { verifyMahasiswa, updateVotedStatus } = require('../controllers/votingController');

router.post('/verify', verifyMahasiswa);
router.post('/update-status', updateVotedStatus);

module.exports = router;