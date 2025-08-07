import express from 'express';
import { createPool } from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 1000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public2')));

const pool = createPool({
    host: "localhost",
    user: "teku",
    password: "teku123",
    database: "teku_database",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Enable auto-commit
pool.on('connection', (conn) => {
    conn.query('SET autocommit=1');
});

async function initializeDatabase() {
    const conn = await pool.getConnection();
    try {
        // Removed DROP TABLE to prevent data loss
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                publish_year DATE,
                price DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Database initialized");
    } catch (err) {
        console.error("Database init failed:", err);
        throw err;
    } finally {
        conn.release();
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public2', 'crud.html'));
});

app.post('/books', async (req, res) => {
    const { title, author, publish_year, price } = req.body;
    if (!title || !author) return res.status(400).json({ error: "Title and author required" });

    const formattedDate = publish_year ? new Date(publish_year).toISOString().split('T')[0] : null;
    const conn = await pool.getConnection();

    try {
        const [result] = await conn.execute(
            'INSERT INTO books (title, author, publish_year, price) VALUES (?, ?, ?, ?)',
            [title, author, formattedDate, price || null]
        );
        res.status(201).json({ success: true, bookId: result.insertId });
    } catch (err) {
        console.error("Create error:", err);
        res.status(500).json({ error: "Failed to create book" });
    } finally {
        conn.release();
    }
});

app.get('/books', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [books] = await conn.execute('SELECT * FROM books ORDER BY created_at DESC');
        res.json({ success: true, books });
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Failed to fetch books" });
    } finally {
        conn.release();
    }
});

app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, publish_year, price } = req.body;
    if (!title || !author) return res.status(400).json({ error: "Title and author required" });

    const formattedDate = publish_year ? new Date(publish_year).toISOString().split('T')[0] : null;
    const conn = await pool.getConnection();

    try {
        const [result] = await conn.execute(
            'UPDATE books SET title = ?, author = ?, publish_year = ?, price = ? WHERE id = ?',
            [title, author, formattedDate, price || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Book not found" });
        res.json({ success: true });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update book" });
    } finally {
        conn.release();
    }
});

app.delete('/books/:id', async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
        const [result] = await conn.execute('DELETE FROM books WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Book not found" });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete book" });
    } finally {
        conn.release();
    }
});

// Error handling
app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
initializeDatabase()
    .then(() => {
        app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    })
    .catch(err => {
        console.error("Server failed to start:", err);
        process.exit(1);
    });