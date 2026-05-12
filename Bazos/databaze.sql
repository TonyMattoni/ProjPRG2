-- CREATE DATABASE IF NOT EXISTS bazos_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE bazos_demo;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    `desc` TEXT NOT NULL,
    price INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    user_email VARCHAR(100) NOT NULL,
    ad_id INT NOT NULL,
    PRIMARY KEY (user_email, ad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Výchozí uživatel
INSERT IGNORE INTO users (name, email, password) VALUES ('Demo', 'demo@bazos.cz', '123');

-- Výchozí inzeráty
INSERT IGNORE INTO ads (id, title, `desc`, price, category, location, author, image) VALUES
(1, 'Prodám zlatého retrívra', 'Krásná štěňata bez PP.', 5000, 'Zvířata', 'Praha', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'),
(2, 'Dětský kočárek', 'Skvělý stav, po jednom dítěti.', 1500, 'Děti', 'Brno', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400'),
(3, 'Herní PC', 'Ryzen 5, 16GB RAM, RTX 3060. Super stav.', 15000, 'Počítače', 'Ostrava', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=400'),
(4, 'Škoda Fabia 1.2 HTP', 'Najeto 150 000 km, STK do 2027.', 45000, 'Auto', 'Plzeň', 'jiný', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400'),
(5, 'iPhone 13 Pro', 'Kondice baterie 89%, bez škrábanců.', 12000, 'Mobily', 'Olomouc', 'jiný', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400'),
(6, 'Horská kola Scott', 'Dvě kola, jetá jednu sezónu.', 25000, 'Sport', 'Liberec', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400'),
(7, 'Šatní skříň PAX', 'Bílá barva, rozměry 200x236 cm.', 4000, 'Nábytek', 'Praha', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=400'),
(8, 'Byt 2+kk k pronájmu', 'Částečně vybavený, blízko centra.', 15000, 'Nemovitosti', 'Brno', 'demo@bazos.cz', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400');

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    buyer_email VARCHAR(100) NOT NULL,
    seller_email VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
