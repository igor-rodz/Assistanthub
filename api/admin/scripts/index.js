import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders, getRequestBody, uuidv4 } from '../../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        await requireAuth(request);
        const supabase = await getSupabase(true); // Admin client

        // GET - Listar scripts
        if (request.method === 'GET') {
            const url = new URL(request.url);
            const category = url.searchParams.get('category');

            let query = supabase
                .from('premium_scripts')
                .select('*')
                .order('created_at', { ascending: false });

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            if (error) throw error;

            return createResponse(data);
        }

        // POST - Criar script
        if (request.method === 'POST') {
            const body = await getRequestBody(request);
            const { title, description, category, script_content, is_active } = body;

            if (!title || !script_content) {
                throw { status: 400, message: 'Título e conteúdo são obrigatórios' };
            }

            const { data, error } = await supabase
                .from('premium_scripts')
                .insert({
                    id: uuidv4(),
                    title,
                    description,
                    category: category || 'Geral',
                    script_content,
                    is_active: is_active !== undefined ? is_active : true,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return createResponse(data, 201);
        }

        // PUT - Atualizar script
        if (request.method === 'PUT') {
            const body = await getRequestBody(request);
            const { id, title, description, category, script_content, is_active } = body;

            if (!id) throw { status: 400, message: 'ID é obrigatório' };

            const updates = {};
            if (title) updates.title = title;
            if (description) updates.description = description;
            if (category) updates.category = category;
            if (script_content) updates.script_content = script_content;
            if (is_active !== undefined) updates.is_active = is_active;

            const { data, error } = await supabase
                .from('premium_scripts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return createResponse(data);
        }

        // DELETE - Remover script
        if (request.method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');

            if (!id) throw { status: 400, message: 'ID é obrigatório' };

            const { error } = await supabase
                .from('premium_scripts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return createResponse({ success: true });
        }

        return createResponse({ message: 'Method not allowed' }, 405);

    } catch (err) {
        // Se a tabela não existir, retornar erro claro
        if (err.code === '42P01') {
            return createErrorResponse({
                status: 500,
                message: 'Tabela premium_scripts não encontrada. Execute o SQL de migração.'
            });
        }
        return createErrorResponse(err);
    }
}
