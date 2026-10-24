const { verifyMahasiswaDB, updateVotedStatusDB } = require('../services/votingService.js');

const verifyMahasiswa = async (req, res) => {
    try {
        const { nim, wallet_address } = req.body;
        const result = await verifyMahasiswaDB(nim, wallet_address);
        res.json({ success: true, message: "Verifikasi berhasil.", data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateVotedStatus = async (req, res) => {
    try {
        const { nim } = req.body;
        await updateVotedStatusDB(nim);
        res.json({ success: true, message: "Status voting berhasil diperbarui." });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = { verifyMahasiswa, updateVotedStatus };