const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 7100;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// GET - Получить все данные профиля
app.get('/api/profile', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'public', 'assets', 'data.json'), 
            'utf8'
        ));
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to read profile data' });
    }
});

// GET - Получить список технологий
app.get('/api/technologies', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'public', 'assets', 'data.json'), 
            'utf8'
        ));
        res.json({ success: true, data: data.technologies });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to read technologies' });
    }
});

// GET - Получить проекты
app.get('/api/projects', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'public', 'assets', 'data.json'), 
            'utf8'
        ));
        res.json({ success: true, data: data.projects });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to read projects' });
    }
});

// POST - Обновить данные (имитация бэкенда)
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }
    
    // Имитация обработки
    console.log(`[CONTACT FORM] From: ${name} (${email})`);
    console.log(`Message: ${message}`);
    
    res.json({ 
        success: true, 
        message: 'Message received successfully',
        timestamp: new Date().toISOString()
    });
});

// GET - Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║     Digital Open Card Server             ║
    ║     Running on http://localhost:${PORT}     ║
    ╚══════════════════════════════════════════╝
    `);
});
