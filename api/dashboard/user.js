const { getSupabase, requireAuth } = require('../_helpers');

module.exports = async (req, res) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    try {
        const user = await requireAuth(req);
        const supabase = getSupabase();

        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if (error) {
            return res.status(404).json({ detail: "User not found" });
        }
        
        return res.json(data);
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ detail: err.message });
        }
        console.error(err);
        return res.status(500).json({ detail: "Error fetching user" });
    }
};
