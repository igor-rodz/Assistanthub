// Test script for DesignLab API
const API_URL = 'https://assistanthub.vercel.app/api/design-lab/create';

async function testDesignLab() {
    console.log('🧪 Testing DesignLab API...\n');

    const testPrompt = "Crie um botão moderno com gradiente azul e animação hover";

    console.log('📝 Prompt:', testPrompt);
    console.log('🌐 URL:', API_URL);
    console.log('\n⏳ Enviando requisição...\n');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            },
            body: JSON.stringify({
                prompt: testPrompt,
                design_type: 'component',
                fidelity: 'high'
            })
        });

        console.log('📊 Status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error Response:', errorText);
            return;
        }

        const data = await response.json();
        console.log('✅ Success!');
        console.log('📦 Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testDesignLab();
