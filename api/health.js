module.exports = async (req, res) => {
    return res.json({ 
        status: "healthy", 
        timestamp: new Date(), 
        version: "2.0.0 (Vercel)" 
    });
};
