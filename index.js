require("dotenv").config(); // ✨ Import dotenv di awal

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === "https://hmps-informatika.vercel.app") {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200, // untuk preflight cepat
  })
);
app.options("*", cors());
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());



// Konfigurasi koneksi database dari .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ssl: { rejectUnauthorized: true }, // aktifkan jika diperlukan
});

// Koneksi ke DB
db.connect((err) => {
    if (err) {
        console.error("❌ Gagal konek ke MySQL:", err.message);
        return;
    }
    console.log("✅ Terhubung ke MySQL:", process.env.DB_NAME);
});


async function createInitialAdminUser() {
    const plainPassword = 'Anhar123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const username = 'Anhar';
    const email = 'anharaldevaro789@gmail.com';

    const sql = "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";
    
    db.query(sql, [username, hashedPassword, email], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                 console.log(`ℹ️ User '${username}' sudah ada.`);
                 return;
            }
            console.error("❌ Gagal membuat user admin awal:", err);
            return;
        }
        console.log(`✅ User admin '${username}' berhasil dibuat dengan password ter-hash.`);
    });
}

app.post("/login", async (req, res) => {
    const { username, password } = req.body; // Mengambil username/email dan password dari body

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username/Email dan Password wajib diisi." });
    }

    // 1. Cari user berdasarkan username atau email
    const sql = "SELECT user_id, username, password_hash FROM users WHERE username = ? OR email = ?";
    
    db.query(sql, [username, username], async (err, results) => {
        if (err) {
            console.error("Error kueri /login:", err);
            return res.status(500).json({ success: false, message: "Kesalahan server saat login." });
        }
        
        // 2. Cek apakah user ditemukan
        if (results.length === 0) {
            // Penting: Beri pesan yang ambigu untuk mencegah enumeration attack
            return res.status(401).json({ success: false, message: "Username atau Password salah." });
        }

        const user = results[0];

        // 3. Verifikasi Password (menggunakan bcrypt)
        // Bandingkan password yang dikirim pengguna dengan password_hash di database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (isPasswordValid) {
            // 4. Login Sukses!
            // 💡 Dalam sistem nyata, di sini Anda akan membuat dan mengirimkan JWT (JSON Web Token)
            
            res.status(200).json({
                success: true,
                message: `Login berhasil! Selamat datang, ${user.username}.`,
                // Tambahkan token atau data yang diperlukan untuk frontend
                user: {
                    id: user.user_id,
                    username: user.username,
                    // Token tidak disertakan di contoh ini, tapi disarankan
                },
                redirect: '/admin/dashboard.html' // URL target setelah login
            });

        } else {
            // 5. Password Salah
            return res.status(401).json({ success: false, message: "Username atau Password salah." });
        }
    });
});

// ---------------- ROUTES ----------------

// 1. Cek server
app.get("/", (req, res) => {
    res.send("API Gallery & Activities 🚀 - Berjalan di Port " + PORT);
});

// 2. Ambil semua data gallery
app.get("/gallery", (req, res) => {
    db.query("SELECT id, title, category, DATE_FORMAT(photo_date, '%Y-%m-%d') as photo_date, image_url FROM gallery", [], (err, results) => {
        if (err) {
            console.error("Error kueri GET /gallery:", err);
            return res.status(500).json({ error: "Gagal mengambil data galeri" });
        }
        res.json(results); 
    });
});
app.post('/gallery', (req, res) => {
    // Ambil data dari body request
    const { title, category, photo_date, image_url } = req.body;

    // Validasi input
    if (!title || !category || !photo_date || !image_url) {
        return res.status(400).json({ error: 'Semua field (judul, kategori, tanggal, URL gambar) wajib diisi.' });
    }

    // Kueri INSERT INTO. Kolom harus sesuai dengan tabel Anda.
    const sql = "INSERT INTO gallery (title, category, photo_date, image_url) VALUES (?, ?, ?, ?)";
    const params = [title, category, photo_date, image_url];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error kueri POST /gallery:", err);
            return res.status(500).json({ error: "Gagal menyimpan foto baru ke database." });
        }
        // Mengembalikan ID baru yang dihasilkan
        console.log(`Foto baru berhasil ditambahkan. ID: ${result.insertId}`);
        res.status(201).json({ 
            message: "Foto berhasil diunggah.",
            id: result.insertId 
        });
    });
});


// =======================================================
// 3. [PUT] Memperbarui Detail Foto (UPDATE)
// =======================================================
app.put('/gallery/:id', (req, res) => {
    const id = req.params.id; // ID diambil dari URL
    const { title, category, photo_date, image_url } = req.body;

    // Validasi input
    if (!title || !category || !photo_date || !image_url) {
        return res.status(400).json({ error: 'Semua field wajib diisi untuk pembaruan.' });
    }

    // Kueri UPDATE
    const sql = "UPDATE gallery SET title = ?, category = ?, photo_date = ?, image_url = ? WHERE id = ?";
    const params = [title, category, photo_date, image_url, id];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(`Error kueri PUT /gallery/${id}:`, err);
            return res.status(500).json({ error: "Gagal memperbarui detail foto di database." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Foto dengan ID ${id} tidak ditemukan.` });
        }

        console.log(`Foto ID ${id} berhasil diperbarui.`);
        res.status(200).json({ 
            message: "Detail foto berhasil diperbarui.",
            id: id 
        });
    });
});


// =======================================================
// 4. [DELETE] Menghapus Foto
// =======================================================
app.delete('/gallery/:id', (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM gallery WHERE id = ?";
    const params = [id];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(`Error kueri DELETE /gallery/${id}:`, err);
            return res.status(500).json({ error: "Gagal menghapus foto dari database." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Foto dengan ID ${id} tidak ditemukan.` });
        }
        
        console.log(`Foto ID ${id} berhasil dihapus.`);
        // 204 No Content adalah status standar untuk DELETE yang sukses tanpa mengembalikan konten
        res.status(204).send();
    });
});


// 3. Ambil data gallery berdasarkan ID
app.get("/gallery/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM gallery WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error kueri /gallery/:id:", err);
            return res.status(500).json({ error: "Gagal mengambil data galeri" });
        }
        res.json(result[0] || {});
    });
});
// 4. Tambah data activities
app.post("/activities", (req, res) => {
    // Hapus 'id' dari destructuring!
    const { title, activity_date, description, category, status } = req.body; 

    // Validasi yang disarankan (tanpa ID):
    if (!title || !activity_date) {
        return res.status(400).json({ error: "Title dan activity_date wajib diisi" });
    }

    const formattedDate = new Date(activity_date).toISOString().split("T")[0];

    // Query SQL sekarang menggunakan kolom yang ditentukan saja (tanpa ID)
    const sql = `
        INSERT INTO activities (title, activity_date, description, category, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, formattedDate, description, category, status], (err, result) => { 
        if (err) {
            // Jika Anda melihat error 'Duplicate entry '0' di sini, 
            // itu berarti Solusi 1 belum berhasil atau server perlu direstart.
            console.error("Error kueri POST /activities:", err);
            return res.status(500).json({ error: "Gagal menambahkan data kegiatan" });
        }
        res.status(201).json({
            message: "✅ Data kegiatan berhasil ditambahkan",
            insertedId: result.insertId
        });
    });
});

app.delete("/activities/:id", (req, res) => {
    // Ambil ID kegiatan dari URL parameter
    const activityId = req.params.id;

    // 🔨 Query SQL untuk DELETE
    // KLAUSA WHERE SANGAT PENTING agar tidak menghapus semua data!
    const sql = `
        DELETE FROM activities
        WHERE id = ?
    `;

    // 📦 Eksekusi Query
    db.query(sql, [activityId], (err, result) => {
        if (err) {
            console.error("Error kueri DELETE /activities/:id:", err);
            return res.status(500).json({ error: "Gagal menghapus data kegiatan" });
        }
        
        // Cek apakah ada baris yang benar-benar terpengaruh (dihapus)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Kegiatan dengan ID ${activityId} tidak ditemukan.` });
        }

        // Respon sukses: status 200 atau 204. Kita pakai 200 dengan pesan.
        res.status(200).json({
            message: `✅ Kegiatan dengan ID ${activityId} berhasil dihapus`,
            deletedId: activityId
        });
    });
});
 
app.put("/activities/:id", (req, res) => {
    // Ambil ID dari URL parameter
    const activityId = req.params.id; 

    // Ambil data yang diperbarui dari body request
    const { title, activity_date, description, category, status } = req.body;

    // 🛑 VALIDASI DATA
    if (!title || !activity_date || !status) {
        return res.status(400).json({ error: "Title, activity_date, dan status wajib diisi untuk pembaruan" });
    }

    // 🧠 Konversi tanggal ISO -> YYYY-MM-DD
    const formattedDate = new Date(activity_date).toISOString().split("T")[0];

    // 🔨 Query SQL untuk UPDATE
    const sql = `
        UPDATE activities
        SET title = ?, activity_date = ?, description = ?, category = ?, status = ?
        WHERE id = ?
    `;

    // 📦 Eksekusi Query
    db.query(
        sql, 
        [title, formattedDate, description, category, status, activityId], 
        (err, result) => {
            if (err) {
                console.error("Error kueri PUT /activities/:id:", err);
                return res.status(500).json({ error: "Gagal memperbarui data kegiatan" });
            }
            
            // Cek apakah ada baris yang benar-benar terpengaruh (diperbarui)
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Kegiatan dengan ID ${activityId} tidak ditemukan.` });
            }

            res.status(200).json({
                message: "✅ Data kegiatan berhasil diperbarui",
                updatedId: activityId
            });
        }
    );
});

// 4. Ambil semua data activities
app.get("/activities", (req, res) => {
    db.query("SELECT * FROM activities", (err, results) => {
        if (err) {
            console.error("Error kueri /activities:", err);
            return res.status(500).json({ error: "Gagal mengambil data kegiatan" });
        }
        res.json(results);
    });
});

// 5. Ambil data activities berdasarkan ID
app.get("/activities/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM activities WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error kueri /activities/:id:", err);
            return res.status(500).json({ error: "Gagal mengambil data kegiatan" });
        }
        res.json(result[0] || {});
    });
});

app.get("/sejarah", (req, res) => {
    db.query("SELECT * FROM about_sejarah", (err, results) => {
        if (err) {
            console.error("Error kueri /sejarah:", err);
            return res.status(500).json({ error: "Gagal mengambil data sejarah" });
        }
        res.json(results);
    });
});

app.get("/budaya", (req, res) => {
    db.query("SELECT * FROM about_budaya", (err, results) => {
        if (err) {
            console.error("Error kueri /budaya:", err);
            return res.status(500).json({ error: "Gagal mengambil data budaya" });
        }
        res.json(results);
    });
});

app.get("/visi-misi", (req, res) => {
    db.query("SELECT * FROM about_visi_misi", (err, results) => {
        if (err) {
            console.error("Error kueri /visi-misi:", err);
            return res.status(500).json({ error: "Gagal mengambil data visi dan misi" });
        }
        res.json(results);
    });
});

// =======================================================
// [PUT] /sejarah
// =======================================================
app.put("/sejarah", (req, res) => { // ❌ Hapus 'async'
    const { deskripsi, tahun_berdiri } = req.body;
    
    if (!deskripsi || !tahun_berdiri) {
        return res.status(400).json({ message: "Deskripsi dan tahun berdiri wajib diisi." });
    }

    const SETTINGS_ID = 1;
    const updateQuery = `
        INSERT INTO about_sejarah (id, deskripsi, tahun_berdiri)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            deskripsi = VALUES(deskripsi), 
            tahun_berdiri = VALUES(tahun_berdiri);
    `;

    // Ganti try/catch dengan db.query(callback)
    db.query(updateQuery, [SETTINGS_ID, deskripsi, tahun_berdiri], (err, result) => {
        if (err) {
            console.error("Error update /sejarah:", err);
            return res.status(500).json({ error: "Gagal memperbarui data sejarah di database." });
        }
        res.json({ message: "Data sejarah berhasil diperbarui." });
    });
});


// =======================================================
// [PUT] /budaya
// =======================================================
app.put("/budaya", (req, res) => { // ❌ Hapus 'async'
    const { slogan, struktur } = req.body;
    
    if (!slogan) {
        return res.status(400).json({ message: "Slogan/Budaya wajib diisi." });
    }

    const SETTINGS_ID = 1;
    const updateQuery = `
        INSERT INTO about_budaya (id, slogan, struktur)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            slogan = VALUES(slogan), 
            struktur = VALUES(struktur);
    `;

    // Ganti try/catch dengan db.query(callback)
    db.query(updateQuery, [SETTINGS_ID, slogan, struktur || null], (err, result) => {
        if (err) {
            console.error("Error update /budaya:", err);
            return res.status(500).json({ error: "Gagal memperbarui data budaya di database." });
        }
        res.json({ message: "Data budaya berhasil diperbarui." });
    });
});


// =======================================================
// [PUT] /visi-misi
// =======================================================
app.put("/visi-misi", (req, res) => { // ❌ Hapus 'async'
    const { visi, misi } = req.body;
    
    if (!visi || !misi) {
        return res.status(400).json({ message: "Visi dan Misi wajib diisi." });
    }

    const SETTINGS_ID = 1;
    const updateQuery = `
        INSERT INTO about_visi_misi (id, visi, misi)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            visi = VALUES(visi), 
            misi = VALUES(misi);
    `;

    // Ganti try/catch dengan db.query(callback)
    db.query(updateQuery, [SETTINGS_ID, visi, misi], (err, result) => {
        if (err) {
            console.error("Error update /visi-misi:", err);
            return res.status(500).json({ error: "Gagal memperbarui data visi dan misi di database." });
        }
        res.json({ message: "Data visi dan misi berhasil diperbarui." });
    });
});


// [GET] Ambil Semua Anggota (Termasuk Filter/Cari)
app.get("/api/anggota", (req, res) => {
    const search = req.query.search; // Ambil parameter query 'search'
    
    let sql = "SELECT id, nama, nim, email, telepon, jabatan, angkatan FROM anggota";
    let params = [];

    // Logika Pencarian
    if (search) {
        const searchTerm = `%${search}%`;
        sql += " WHERE nama LIKE ? OR nim LIKE ? OR email LIKE ? OR jabatan LIKE ?";
        // Perhatikan urutan parameter harus sesuai dengan klausa WHERE
        params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error kueri GET /api/anggota:", err);
            return res.status(500).json({ status: "error", message: "Gagal mengambil data anggota" });
        }
        res.status(200).json({
            status: "success",
            total: results.length,
            data: results
        });
    });
});

// [POST] Tambah Anggota Baru
app.post('/api/anggota', (req, res) => {
    const { nama, nim, email, telepon, jabatan, angkatan } = req.body;

    if (!nama || !nim || !email || !jabatan || !angkatan) {
        return res.status(400).json({ status: "error", message: "Nama, NIM, Email, Jabatan, dan Angkatan harus diisi." });
    }

    const sql = `
        INSERT INTO anggota (nama, nim, email, telepon, jabatan, angkatan) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [nama, nim, email, telepon, jabatan, angkatan];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error kueri POST /api/anggota:", err);
            // Tangani error UNIQUE KEY (misalnya NIM/Email sudah terdaftar)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ status: "error", message: "NIM atau Email sudah terdaftar. Mohon cek kembali." });
            }
            return res.status(500).json({ status: "error", message: "Kesalahan server saat menambahkan data." });
        }
        
        res.status(201).json({
            status: "success",
            message: "Anggota baru berhasil ditambahkan.",
            id: result.insertId
        });
    });
});

// [PUT] Perbarui Data Anggota
app.put('/api/anggota/:id', (req, res) => {
    const memberId = req.params.id;
    const { nama, nim, email, telepon, jabatan, angkatan } = req.body;

    if (!nama || !nim || !email || !jabatan || !angkatan) {
        return res.status(400).json({ status: "error", message: "Semua field wajib diisi untuk pembaruan." });
    }

    const sql = `
        UPDATE anggota 
        SET nama = ?, nim = ?, email = ?, telepon = ?, jabatan = ?, angkatan = ? 
        WHERE id = ?
    `;
    const params = [nama, nim, email, telepon, jabatan, angkatan, memberId];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error kueri PUT /api/anggota/:id:", err);
             // Tangani error UNIQUE KEY
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ status: "error", message: "NIM atau Email sudah terdaftar pada anggota lain." });
            }
            return res.status(500).json({ status: "error", message: "Kesalahan server saat memperbarui data." });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: `Anggota dengan ID ${memberId} tidak ditemukan.` });
        }

        res.status(200).json({
            status: "success",
            message: `Data anggota ID ${memberId} berhasil diperbarui.`
        });
    });
});

// [DELETE] Hapus Anggota
app.delete('/api/anggota/:id', (req, res) => {
    const memberId = req.params.id;

    const sql = "DELETE FROM anggota WHERE id = ?";

    db.query(sql, [memberId], (err, result) => {
        if (err) {
            console.error("Error kueri DELETE /api/anggota/:id:", err);
            return res.status(500).json({ status: "error", message: "Kesalahan server saat menghapus data." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: `Anggota dengan ID ${memberId} tidak ditemukan.` });
        }

        res.status(200).json({
            status: "success",
            message: `Anggota ID ${memberId} berhasil dihapus.`
        });
    });
});

 createInitialAdminUser()

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});