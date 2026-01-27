import {
    getGeminiModel,
    getSupabase,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    uuidv4,
    getRequestBody,
    createResponse,
    createErrorResponse,
    corsHeaders
} from '../_helpers.js';

// Synthesized Design Brain: Frontend Specialist + Motion Intelligence
// Opinionated premium Tailwind/UI directive
const CONST_GENERIC_DESIGN_DIRECTIVE = `
# ROLE
You are a senior UI/UX designer and front-end engineer specialized in premium SaaS landing pages, dashboards and components.

# GLOBAL GOAL
- Designs must look like modern Dribbble/SaaS shots, never like plain unstyled HTML.
- Always be responsive (mobile-first) with good spacing, typography and contrast.
- Prefer Tailwind CSS utility classes over raw CSS whenever possible.

# VISUAL GUIDELINES
1. **Layout & Hierarchy**
   - Strong hero section with big headline, clear subheadline and 1–2 primary CTAs.
   - Use grids (2–4 columns) for features, cards, pricing, etc.
   - Use plenty of whitespace with \`max-w-*\`, \`mx-auto\`, \`py-*\`, \`px-*\`.
2. **Style**
   - Dark or neutral background with subtle gradients (e.g. \`from-purple-500/20 to-sky-500/10\`).
   - Cards with \`rounded-2xl\`, \`border-white/10\`, soft shadows and hover states.
   - Use \`font-semibold\`/ \`font-bold\` for headings and \`text-white/60\` for secondary text.
3. **Images & Icons (MANDATORY)**
   - Always include at least **2 real illustrative images**:
     - e.g. \`https://images.unsplash.com/...\` with \`?auto=format&fit=crop&w=1600&q=80\`.
   - Never leave empty boxes; if there is no photo, create a gradient illustration/card.
   - Use simple inline SVGs or icon-like elements for feature bullets.
4. **Content**
   - Avoid fully generic text; infer product name, sections and CTAs from the user prompt.
   - Some lorem ipsum is OK for long paragraphs, but not for all text.

# TYPE-SPECIFIC GUIDELINES
- If **Type = "landing_page"**:
  - You MUST build a complete page with, at minimum, these sections (each as its own <section>):
    1) Hero (headline, subheadline, CTAs, supporting badge or label + hero image/mockup)
    2) Social proof or client logos
    3) Features grid (3–6 items)
    4) Highlight / benefits section in 2 columns
    5) Simple pricing section OR strong final call-to-action
    6) Footer with basic links
  - Do NOT put everything inside a single <section>. Use multiple well-defined <section> blocks.
- If **Type = "component"**:
  - Focus on a single strong component (card, pricing tier, hero block, navbar, etc.).
  - Center it inside a beautiful page background so the screenshot looks premium.
- If **Type = "dashboard"**:
  - Layout with sidebar navigation, top bar and statistic cards.
  - Represent charts using styled divs (fake bars/lines) instead of external chart libs.
- If **Type = "app"**:
  - Main screen of a real app (list, filters, tabs, actions) following mobile/desktop patterns.

# FIDELITY
- If **Fidelity = "wireframe"**: clear structure, fewer colors, but the same number of sections.
- If **Fidelity = "medium"**: visually solid UI, ready for a simple design system.
- If **Fidelity = "high"**: premium visual with gradients, shadows and good microcopy.

# TECH STACK
- Use Tailwind via CDN for all utility classes.
- Use semantic HTML5 only; if you need interactivity, use vanilla JS inside <script>.

# OUTPUT RULES
- Single self-contained HTML file that looks production-ready, not a wireframe.
- Use **multiple <section> elements** to separate content blocks.
- No external CSS/JS files; everything must run standalone in the browser.
`;

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { prompt, design_type = "component", fidelity = "high" } = body;

        if (!prompt) {
            throw { status: 400, message: "Missing 'prompt' field" };
        }

        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) {
            throw { status: 402, message: "Insufficient credits" };
        }

        // Construct the Super Prompt
        const aiPrompt = `
${CONST_GENERIC_DESIGN_DIRECTIVE}

# TASK
Generate a specific design following the guidelines above.

**User Request**: "${prompt}"
**Type**: ${design_type}
**Fidelity**: ${fidelity}

**OUTPUT FORMAT**:
Responda APENAS com JSON válido (sem markdown, sem \`\`\`json).
O JSON deve seguir esta estrutura estrita:
{
    "explanation": "Breve justificativa de 1 frase para o estilo escolhido",
    "html": "<!DOCTYPE html>... string HTML completa com Tailwind CDN e quaisquer <script> necessários ...",
    "css": "",
    "component_count": 1
}

**CODE REQUIREMENTS**:
1. Arquivo único com HTML completo, pronto para abrir no navegador.
2. Use Tailwind via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Se precisar de animações adicionais, você pode incluir GSAP/ScrollTrigger via CDN.
4. Não use React/Vue ou imports de módulos; apenas HTML, Tailwind e JS vanilla.
`;

        const model = await getGeminiModel();
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        let designResult;
        try {
            if (jsonStart > -1 && jsonEnd > -1) {
                designResult = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Text:", text);
            designResult = {
                html: `<div style="color:red; pad:20px;"><h1>Generation Error</h1><p>Sorry, the AI brain malfunctioned. Please try again.</p><pre>${parseError.message}</pre></div>`,
                css: "",
                component_count: 0,
                explanation: "Parsing failure fallback."
            };
        }

        // Token/Cost Calculation
        const tokensIn = Math.ceil(aiPrompt.length / 4);
        const tokensOut = Math.ceil(text.length / 4);
        const fidelityMult = { "wireframe": 0.5, "medium": 1.0, "high": 2.0 }[fidelity] || 1.0;
        const creditCost = 0.5 * fidelityMult;

        const { remaining } = await deductCredits(
            user.id, creditCost, 'design_job', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut
        );

        const supabase = await getSupabase();
        const jobId = uuidv4();

        const jobData = {
            job_id: jobId,
            user_id: user.id,
            status: "complete",
            html: designResult.html,
            css: designResult.css || "", // CSS is embedded in HTML now, but keeping field for schema compat
            component_count: designResult.component_count || 1,
            prompt: prompt,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            credits_used: creditCost,
            credits_remaining: remaining,
            created_at: new Date().toISOString()
        };

        try {
            await supabase.from('design_jobs').insert(jobData);
        } catch (dbErr) {
            console.error("Failed to save design job:", dbErr);
        }

        return createResponse(jobData);

    } catch (err) {
        return createErrorResponse(err);
    }
}
