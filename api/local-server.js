import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Handlers Imports
import health from './health.js';
import analyzeError from './analyze-error.js';
import metrics from './dashboard/metrics.js';
import tools from './dashboard/tools.js';
import user from './dashboard/user.js';

import adminUsers from './admin/users.js';
import adminDashboardStats from './admin/dashboard/stats.js';
import adminCreditsTransactions from './admin/credits/transactions.js';
import adminUsageLogs from './admin/usage-logs.js';
// import adminScripts from './admin/scripts/index.js';
// import userScripts from './scripts/index.js';
import creditsBalance from './credits/balance.js';
import creditsUsage from './credits/usage.js';
import creditsHistory from './credits/history.js';
import setPlan from './credits/set-plan.js';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Adapter for Vercel/Edge-like handlers to Express
const adapt = (handler) => async (req, res) => {
    try {
        const url = `http://${req.headers.host}${req.url}`;

        // Construct standard Headers
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => headers.append(key, v));
            } else if (value) {
                headers.append(key, value);
            }
        });

        const webReq = new Request(url, {
            method: req.method,
            headers: headers,
            body: ['GET', 'HEAD'].includes(req.method) ? null : JSON.stringify(req.body)
        });

        const response = await handler(webReq);

        // Convert Response to Express
        response.headers.forEach((val, key) => res.setHeader(key, val));
        res.status(response.status);

        const text = await response.text();
        try {
            // Try parsing as JSON to send proper json response (Express handles content-type usually but let's be safe)
            const json = JSON.parse(text);
            res.json(json);
        } catch {
            res.send(text);
        }
    } catch (e) {
        console.error('Handler Adapter Error:', e);
        res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
};

// --- Routes Mapping ---

// Health & Analysis
app.all('/api/health', adapt(health));
app.all('/api/analyze-error', adapt(analyzeError));

// Dashboard
app.all('/api/dashboard/metrics', adapt(metrics));
app.all('/api/dashboard/tools', adapt(tools));
app.all('/api/dashboard/user', adapt(user));

// Admin
app.all('/api/admin/users', adapt(adminUsers));
app.all('/api/admin/dashboard/stats', adapt(adminDashboardStats));
app.all('/api/admin/credits/transactions', adapt(adminCreditsTransactions));
app.all('/api/admin/usage-logs', adapt(adminUsageLogs));
// app.all('/api/admin/scripts', adapt(adminScripts));
// app.all('/api/scripts', adapt(userScripts));
app.all('/api/credits/balance', adapt(creditsBalance));
app.all('/api/credits/usage', adapt(creditsUsage));
app.all('/api/credits/history', adapt(creditsHistory));
app.all('/api/credits/set-plan', adapt(setPlan));

// 404
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`✅ API Local Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
});
