require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    
    // Create tables first
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        service VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure phone column exists for existing tables
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='phone') THEN
          ALTER TABLE submissions ADD COLUMN phone VARCHAR(50);
        END IF;
      END $$;
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables ready");
    
    // Check/Create admin user
    const adminExists = await client.query("SELECT * FROM admins WHERE username = $1", [process.env.ADMIN_USERNAME]);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await client.query(
        "INSERT INTO admins (username, password) VALUES ($1, $2)",
        [process.env.ADMIN_USERNAME, hashedPassword]
      );
      console.log("✅ Admin user created");
    }
    
  } catch (err) {
    console.error("❌ Database init error:", err);
  } finally {
    if (client) client.release();
  }
}

initDatabase();

app.post("/api/submit", async (req, res) => {
  try {
    const { name, email, phone, message, service } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const result = await pool.query(
      "INSERT INTO submissions (name, email, phone, message, service) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, phone || null, message, service || null]
    );

    console.log(`📩 New submission from ${name} (${email}): ${phone || 'No phone'}`);
    return res.json({ success: true, message: "Form submitted successfully", data: result.rows[0] });

  } catch (error) {
    console.error("❌ Error submitting form:", error);
    return res.status(500).json({ success: false, message: "Form submission failed" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    return res.json({ success: true, message: "Login successful", admin: { id: result.rows[0].id, username: result.rows[0].username } });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.get("/api/admin/submissions", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = credentials[0];
    const password = credentials[1];

    const adminResult = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    
    if (adminResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, adminResult.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const submissions = await pool.query("SELECT * FROM submissions ORDER BY created_at DESC");
    return res.json({ success: true, data: submissions.rows });

  } catch (error) {
    console.error("❌ Fetch submissions error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
});

app.get("/api/admin/submissions/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = credentials[0];
    const password = credentials[1];

    const adminResult = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    
    if (adminResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, adminResult.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const result = await pool.query("SELECT * FROM submissions WHERE id = $1", [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    return res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error("❌ Fetch submission error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch submission" });
  }
});

app.delete("/api/admin/submissions/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = credentials[0];
    const password = credentials[1];

    const adminResult = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    
    if (adminResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, adminResult.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await pool.query("DELETE FROM submissions WHERE id = $1", [req.params.id]);
    return res.json({ success: true, message: "Submission deleted" });

  } catch (error) {
    console.error("❌ Delete submission error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete submission" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
