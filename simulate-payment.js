// Native fetch is available in Node 18+


async function simulateWebhook() {
    const url = 'http://localhost:8000/api/webhooks/perfectpay';

    // Simulate Perfect Pay payload
    // Status 2 = Approved
    const payload = {
        token: 'seu_token_secreto_aqui', // Matches .env I just added
        code: 'TEST_TRANSACTION_' + Date.now(),
        sale_amount: 39.90,
        sale_status_enum: 2,
        payment_method_enum: 1,
        customer: {
            email: 'igorhrodrick@gmail.com',
            full_name: 'Igor Test User'
        }
    };

    console.log('Sending webhook payload:', payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text}`);
    } catch (error) {
        console.error('Webhook simulation failed:', error);
    }
}

simulateWebhook();
