const { getSupabase } = require('../_helpers');

module.exports = async (req, res) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    try {
        const supabase = getSupabase();
        const { data } = await supabase.from('tools').select('*').order('id');
        return res.json(data || []);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ detail: "Error fetching tools" });
    }
};
