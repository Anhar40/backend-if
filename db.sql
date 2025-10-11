

-- 2️⃣ Buat ulang tabel dengan id AUTO_INCREMENT
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    activity_date DATE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(20)
);


INSERT INTO activities (id, title, activity_date, description, category, status) VALUES
(1, 'Pelatihan Dasar Web Development', '2025-10-15', 'Workshop intensif untuk mahasiswa baru mengenai HTML, CSS, dan JavaScript dasar.', 'Pendidikan', 'upcoming'),
(2, 'Lomba Hackathon Informatika 2025', '2025-11-01', 'Kompetisi pemrograman 24 jam untuk memecahkan masalah dengan teknologi inovatif.', 'Kompetisi', 'upcoming'),
(3, 'Malam Keakraban Angkatan 2024', '2025-09-20', 'Acara santai untuk mempererat hubungan antar mahasiswa informatika lintas angkatan.', 'Sosial', 'done');




CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  photo_date DATE NOT NULL,
  image_url VARCHAR(512) NOT NULL
);


INSERT INTO gallery (id, title, category, photo_date, image_url) VALUES
(1, 'Sesi Coding Workshop Mobile', 'Workshop', '2024-10-10', 'https://placehold.co/800x600/4f46e5/ffffff?text=Workshop+Mobile'),
(2, 'Penyerahan Hadiah Lomba UI/UX', 'Kompetisi', '2024-09-25', 'https://placehold.co/800x600/10b981/ffffff?text=Lomba+UI%2FUX'),
(3, 'Anggota HMPS Berpose dengan UMKM', 'Sosial', '2024-09-15', 'https://placehold.co/800x600/f59e0b/ffffff?text=Bakti+Sosial+UMKM'),
(4, 'Foto Bersama di Seminar Siber', 'Workshop', '2024-08-05', 'https://placehold.co/800x600/ef4444/ffffff?text=Seminar+Siber'),
(5, 'Sesi Diskusi Internal Program Kerja', 'Internal', '2024-07-01', 'https://placehold.co/800x600/3b82f6/ffffff?text=Rapat+Internal'),
(6, 'Lomba Cepat Tepat Coding', 'Kompetisi', '2024-06-10', 'https://placehold.co/800x600/8b5cf6/ffffff?text=Lomba+Coding'),
(7, 'Penyuluhan Teknologi di Desa', 'Sosial', '2024-05-20', 'https://placehold.co/800x600/14b8a6/ffffff?text=Penyuluhan+Desa'),
(8, 'Malam Keakraban Anggota Baru', 'Internal', '2024-04-01', 'https://placehold.co/800x600/ec4899/ffffff?text=Malam+Keakraban');

-- Hapus tabel lama jika ada
-- ===============================
-- 1️⃣ TABEL SEJARAH
-- ===============================
CREATE TABLE about_sejarah (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tahun_berdiri VARCHAR(10) NOT NULL,
    deskripsi TEXT NOT NULL,
    tambahan TEXT
);

INSERT INTO about_sejarah (tahun_berdiri, deskripsi, tambahan) VALUES
('2010',
'HMPS Informatika dibentuk pada tahun **2010** oleh sekelompok mahasiswa perintis yang memiliki semangat tinggi untuk memajukan komunitas IT di kampus. Organisasi ini berawal dari sebuah klub studi kecil hingga menjadi wadah resmi mahasiswa Program Studi Informatika. Sejak saat itu, kami terus berupaya menjadi jembatan antara mahasiswa, dosen, dan dunia industri.',
'Telah berkontribusi selama lebih dari 15 angkatan mahasiswa dan menghasilkan banyak alumni sukses di bidang teknologi.');

-- ===============================
-- 2️⃣ TABEL BUDAYA
-- ===============================
CREATE TABLE about_budaya (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slogan TEXT NOT NULL,
    struktur TEXT NOT NULL,
    tambahan TEXT
);

INSERT INTO about_budaya (slogan, struktur, tambahan) VALUES
('Menciptakan **kode** yang bersih, **komunitas** yang kuat, dan **masa depan** yang terdepan.',
'HMPS terbagi menjadi empat divisi utama: Pendidikan & Pelatihan, Riset & Pengembangan, Hubungan Masyarakat, dan Kemitraan Strategis. Setiap divisi bekerja secara sinergis untuk mencapai visi organisasi.',
'Nilai inti kami adalah **Inovasi**, **Integritas**, dan **Kolaborasi**.');

-- ===============================
-- 3️⃣ TABEL VISI DAN MISI
-- ===============================
-- Pastikan kolom ID di set sebagai PRIMARY KEY
-- Hapus tabel jika sudah ada
DROP TABLE IF EXISTS about_visi_misi;

-- Buat tabel baru
CREATE TABLE about_visi_misi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visi TEXT NOT NULL,
    misi TEXT NOT NULL
);

-- Masukkan data visi & misi
INSERT INTO about_visi_misi (visi, misi) VALUES
('Menjadi organisasi mahasiswa yang **revolusioner dan adaptif** dalam mengembangkan potensi akademik dan non-akademik mahasiswa Informatika, serta menjadi pusat rujukan teknologi di tingkat perguruan tinggi.',
'Mengembangkan program pelatihan dan *workshop* berkala untuk meningkatkan *hard skill* dan *soft skill* mahasiswa.'),
('Menjadi organisasi mahasiswa yang **revolusioner dan adaptif** dalam mengembangkan potensi akademik dan non-akademik mahasiswa Informatika, serta menjadi pusat rujukan teknologi di tingkat perguruan tinggi.',
'Mendorong partisipasi aktif mahasiswa dalam proyek penelitian, kompetisi nasional, dan konferensi teknologi.'),
('Menjadi organisasi mahasiswa yang **revolusioner dan adaptif** dalam mengembangkan potensi akademik dan non-akademik mahasiswa Informatika, serta menjadi pusat rujukan teknologi di tingkat perguruan tinggi.',
'Membangun iklim organisasi yang suportif, profesional, dan penuh kekeluargaan.'),
('Menjadi organisasi mahasiswa yang **revolusioner dan adaptif** dalam mengembangkan potensi akademik dan non-akademik mahasiswa Informatika, serta menjadi pusat rujukan teknologi di tingkat perguruan tinggi.',
'Menjalin kemitraan strategis dengan perusahaan teknologi dan asosiasi profesional untuk memfasilitasi karir alumni.'),
('Menjadi organisasi mahasiswa yang **revolusioner dan adaptif** dalam mengembangkan potensi akademik dan non-akademik mahasiswa Informatika, serta menjadi pusat rujukan teknologi di tingkat perguruan tinggi.',
'Menjadi representasi suara mahasiswa Informatika kepada pihak Program Studi dan Fakultas.');

-- 1. TABEL: users (Akun Login Admin)
-- Berisi data admin yang digunakan untuk masuk ke dashboard.
-- 1. TABEL: users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE
);


-- Skrip SQL untuk membuat tabel 'anggota'
-- Gunakan skrip ini di sistem manajemen database Anda (MySQL, PostgreSQL, SQL Server, dll.)

-- Hapus tabel jika sudah ada
DROP TABLE IF EXISTS anggota;

-- Buat tabel anggota
CREATE TABLE anggota (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    nim VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telepon VARCHAR(15),
    jabatan VARCHAR(50),
    angkatan YEAR(4),
    tanggal_bergabung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_diperbarui TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Masukkan beberapa data anggota contoh
INSERT INTO anggota (nama, nim, email, telepon, jabatan, angkatan) VALUES
('Imam Nuralim', '2205011001', 'imam.nuralim@example.com', '081234567890', 'Ketua', 2022),
('Siti Nurhaliza', '2205011002', 'siti.nurhaliza@example.com', '081298765432', 'Wakil Ketua', 2022),
('Bima Chord', '2205011003', 'bima.chord@example.com', '081223344556', 'Sekretaris', 2023),
('Rizky Pratama', '2205011004', 'rizky.pratama@example.com', '082112223334', 'Bendahara', 2023),
('Anisa Rahma', '2205011005', 'anisa.rahma@example.com', '081345678901', 'Koordinator Acara', 2024),
('Dimas Saputra', '2205011006', 'dimas.saputra@example.com', '081987654321', 'Anggota', 2024),
('Putri Maharani', '2205011007', 'putri.maharani@example.com', '081556677889', 'Anggota', 2023),
('Fajar Nugroho', '2205011008', 'fajar.nugroho@example.com', '081312345678', 'Divisi Media', 2022);
