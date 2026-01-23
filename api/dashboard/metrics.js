const { getSupabase, requireAuth, corsHeaders, uuidv4 } = require('../_helpers');

module.exports = async (req, res) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    try {
        const user = await requireAuth(req);
        const supabase = getSupabase();

        const [corrections, designs] = await Promise.all([
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'oneshot_fixes'),
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'design_job')
        ]);

        return res.json({
            id: uuidv4(),
            corrections: corrections.count || 0,
            designs: designs.count || 0,
            saved: 0,
            updated_at: new Date()
        });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ detail: err.message });
        }
        console.error(err);
        return res.status(500).json({ detail: "Error fetching metrics" });
    }
};
