const getStatus = async(req, res) => {
    return res.status(200).json({
        message: 'server OK'
    });
};

module.exports = {
    getStatus
};
