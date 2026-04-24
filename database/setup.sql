-- ============================================================
-- Local Tourist Day-Visit Planner — Database v4
-- Student: Enara Wickramasinghe (E2320627) | ITE2953
-- University of Moratuwa | 2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS tourist_planner;
USE tourist_planner;

CREATE TABLE IF NOT EXISTS users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('tourist','admin') DEFAULT 'tourist',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS places (
    PlaceID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Distance DECIMAL(5,2) NOT NULL,
    Description TEXT NOT NULL,
    OpeningHours VARCHAR(150),
    Latitude DECIMAL(10,7) NOT NULL,
    Longitude DECIMAL(10,7) NOT NULL,
    ImageURL LONGTEXT,
    BestTime VARCHAR(150),
    TravelTips TEXT,
    Transport VARCHAR(255),
    Accessibility VARCHAR(255),
    CrowdLevel VARCHAR(150),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit_plans (
    PlanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PlanName VARCHAR(150) DEFAULT 'My Day Plan',
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plan_details (
    DetailID INT AUTO_INCREMENT PRIMARY KEY,
    PlanID INT NOT NULL,
    PlaceID INT NOT NULL,
    OrderIndex INT DEFAULT 0,
    FOREIGN KEY (PlanID) REFERENCES visit_plans(PlanID) ON DELETE CASCADE,
    FOREIGN KEY (PlaceID) REFERENCES places(PlaceID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    PlaceID INT NOT NULL,
    UserID INT,
    AuthorName VARCHAR(100) NOT NULL,
    Rating TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Body TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlaceID) REFERENCES places(PlaceID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE SET NULL
);

-- ============================================================
-- 14 TOURIST ATTRACTIONS — updated precise coordinates
-- ============================================================
INSERT INTO places (Name, Category, Distance, Description, OpeningHours, Latitude, Longitude, ImageURL, BestTime, TravelTips, Transport, Accessibility, CrowdLevel) VALUES

('Mount Lavinia Beach', 'Beach', 6.00,
'A golden beach stretching along the Indian Ocean, perfect for sunset strolls and fresh seafood. The clifftop Mount Lavinia Hotel adds a charming colonial backdrop to this iconic destination just south of Colombo.',
'Open 24 hours', 6.8372, 79.8722,
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Mount_Lavinia_Beach_%281%29.jpg/1280px-Mount_Lavinia_Beach_%281%29.jpg',
'Late afternoon to evening — golden hour sunsets are stunning',
'Bring sunscreen and water. Avoid swimming during rough sea conditions. Food stalls are best visited after 5 PM.',
'Take a tuk-tuk or bus (Route 2) from Moratuwa. About 15–20 minutes by road.',
'Flat sandy beach, easy to walk. Wheelchair accessible along the promenade.',
'Crowded on weekends and public holidays. Visit on a weekday morning for a peaceful experience.'),

('Dehiwala Zoological Garden', 'Wildlife', 8.00,
'One of the oldest and most visited zoos in South Asia, home to over 3,000 animals across 350 species. Famous for elephant shows, the zoo also features an impressive aquarium and botanical garden.',
'8:30 AM – 6:00 PM Daily', 6.8524, 79.8710,
'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Elephant_at_Dehiwala_zoo.jpg/1280px-Elephant_at_Dehiwala_zoo.jpg',
'Morning (8:30–11:00 AM) — animals are most active and it is cooler',
'Arrive early to catch the elephant show. Wear comfortable shoes as there is a lot of walking. Bring water and snacks.',
'Bus Route 2 from Moratuwa stops near the zoo. Tuk-tuks easily available.',
'Paved pathways throughout. Mostly wheelchair accessible but some areas are uneven.',
'Very busy on weekends and school holidays. Weekday mornings are the best time.'),

('Attidiya Bird Sanctuary', 'Nature', 9.00,
'A tranquil wetland reserve sheltering over 70 species of birds. An ideal escape for birdwatchers and nature photographers seeking calm green surroundings on the outskirts of Colombo.',
'Daily — Sunrise to Sunset', 6.8416, 79.8913,
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Attidiya_bird_sanctuary.JPG/1280px-Attidiya_bird_sanctuary.JPG',
'Early morning (6:00–9:00 AM) — best for birdwatching when birds are most active',
'Bring binoculars for the best birdwatching experience. Wear muted colours and walk quietly to avoid disturbing birds. Insect repellent recommended.',
'Best reached by tuk-tuk. Limited public transport directly to the sanctuary.',
'Flat walking paths but some muddy areas after rain. Wear closed shoes.',
'Generally quiet and peaceful. Light crowds even on weekends.'),

('Bolgoda Lake', 'Nature', 5.00,
'Sri Lanka''s largest natural lake spanning Panadura and Moratuwa. Ideal for boating, kayaking and peaceful lakeside picnics. A favourite weekend getaway for locals.',
'Open 24 hours', 6.7711, 79.9075,
'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bolgoda_Lake_Sri_Lanka.jpg/1280px-Bolgoda_Lake_Sri_Lanka.jpg',
'Early morning or late afternoon — calm waters and beautiful light for photos',
'Hire a boat for the best experience. Bring insect repellent for the evening. The lake is best enjoyed at sunset.',
'Accessible by tuk-tuk from Moratuwa in about 10 minutes. Limited bus services.',
'Mostly flat terrain around the lake. Good for casual walking.',
'Quiet on weekdays. Gets busier on weekend afternoons with local families.'),

('Gangaramaya Temple', 'Religious', 18.00,
'One of Sri Lanka''s most important Buddhist temples, beside Beira Lake in Colombo. Home to a fascinating museum and library, it dazzles during the Navam Perahera festival.',
'6:00 AM – 10:00 PM', 6.9164, 79.8564,
'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Gangaramaya_temple_colombo.jpg/1280px-Gangaramaya_temple_colombo.jpg',
'Morning (7:00–10:00 AM) — peaceful atmosphere before crowds arrive',
'Dress modestly — cover shoulders and knees. Remove shoes before entering. The museum inside is a must-see.',
'Take a bus to Colombo Fort then a tuk-tuk. About 45 minutes from Moratuwa.',
'Mostly accessible but some uneven stone flooring inside the temple complex.',
'Busy during poya days and the Navam Perahera season. Early mornings are most peaceful.'),

('Independence Memorial Hall', 'Historical', 17.00,
'A magnificent national monument commemorating Sri Lanka''s independence from British rule in 1948. Set within beautiful park grounds popular with families and history enthusiasts.',
'8:30 AM – 5:00 PM', 6.9046, 79.8673,
'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Independence_memorial_hall_of_sri_lanka.jpg/1280px-Independence_memorial_hall_of_sri_lanka.jpg',
'Morning — cooler temperatures make it more comfortable for walking the grounds',
'Great for photography especially in the morning light. Walk around the entire monument for the best views.',
'Bus to Colombo, then tuk-tuk from Fort or Maradana. About 50 minutes total.',
'Well-paved paths around the monument. Good wheelchair access in the park.',
'Quieter on weekday mornings. Busy on weekends and national holidays.'),

('Viharamahadevi Park', 'Urban Park', 18.00,
'Colombo''s oldest and largest public park. A golden Buddha statue presides over well-kept grounds, popular for family outings, jogging, and cultural events.',
'Open 24 hours', 6.9133, 79.8617,
'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Viharamahadevi_Park.jpg/1280px-Viharamahadevi_Park.jpg',
'Early morning or late evening — ideal for a relaxing stroll when it is cool',
'Ideal for a picnic lunch. The park has clean benches and open lawns. The fountain area is great for photos.',
'Bus to Colombo Town Hall, then a short walk. About 45 minutes from Moratuwa.',
'Flat, paved paths throughout. Very wheelchair and stroller friendly.',
'Busy in the evenings and on weekends. Weekday mornings are very peaceful.'),

('National Museum of Colombo', 'Museum', 18.00,
'Sri Lanka''s largest museum, founded in 1877. Preserves the royal throne and crown of the Kandyan Kings and rare artefacts spanning over 2,500 years of history.',
'9:00 AM – 5:00 PM (Closed Fridays)', 6.9104, 79.8610,
'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Colombo_national_museum.jpg/1280px-Colombo_national_museum.jpg',
'Morning — allows enough time to explore all galleries before closing',
'Plan at least 2 hours to explore. Photography allowed in most areas. Closed on Fridays — plan accordingly.',
'Bus to Colombo then tuk-tuk to Viharamahadevi area. About 50 minutes total.',
'Well-maintained ramps and lifts. Good wheelchair access throughout most of the museum.',
'Moderate crowd on weekdays. Very busy on weekends and during school visits.'),

('Galle Face Green', 'Recreation', 20.00,
'A beloved ocean-side promenade in central Colombo. Famous for kite flying, street food, and spectacular sunsets over the Indian Ocean.',
'Open 24 hours', 6.9266, 79.8435,
'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Galle_Face_Green.jpg/1280px-Galle_Face_Green.jpg',
'Late afternoon to sunset (4:00–7:00 PM) — the golden hour views are breathtaking',
'Try the local street food — isso wade and kottu are must-haves. Best visited at sunset. Keep your belongings secure in busy evenings.',
'Bus to Colombo Fort then a tuk-tuk to Galle Face. About 55 minutes from Moratuwa.',
'Flat open promenade. Fully accessible for wheelchairs and pushchairs.',
'Very busy on weekend evenings. Quieter on weekday mornings.'),

('Bellanwila Rajamaha Viharaya', 'Religious', 10.00,
'A highly revered Buddhist temple dating back to the 3rd century BC. Famous for its magnificent Perahera procession featuring beautifully adorned elephants.',
'5:30 AM – 9:00 PM', 6.8456, 79.8900,
'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Bellanwila_Raja_Maha_Viharaya.jpg/1280px-Bellanwila_Raja_Maha_Viharaya.jpg',
'Early morning (5:30–8:00 AM) — most serene with morning prayers and offerings',
'Dress respectfully — cover shoulders and knees. Remove shoes at the entrance. The temple grounds are very peaceful early in the morning.',
'Take a tuk-tuk from Moratuwa or Dehiwala. About 20–25 minutes.',
'Some uneven stone paths. Wear flat shoes. Partial wheelchair access.',
'Busy on poya days and during the annual Perahera. Quiet on regular weekday mornings.'),

('Sri Lanka Air Force Museum', 'Historical', 7.00,
'An open-air aviation museum at Ratmalana Air Force Base. Features decommissioned fighter jets, helicopters, and transport aircraft on display.',
'9:00 AM – 5:00 PM (Closed Mondays)', 6.8242, 79.8917,
'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/SLAF_Ratmalana_Museum.jpg/1280px-SLAF_Ratmalana_Museum.jpg',
'Morning — cooler and better lighting for aircraft photography',
'Great for aviation enthusiasts and families with children. Bring a camera for the aircraft displays. Closed on Mondays.',
'Tuk-tuk from Moratuwa in about 15 minutes. Near Ratmalana Airport.',
'Open grounds with flat terrain. Good for walking. Some aircraft are accessible up-close.',
'Generally quiet. Best visited on weekdays to avoid school group visits.'),

('Traditional Puppet Art Museum', 'Cultural', 8.00,
'A charming museum dedicated to Sri Lanka''s traditional puppet arts including Kolam masks and Nadagam puppets. A rare cultural gem.',
'9:00 AM – 5:00 PM', 6.8400, 79.8700,
'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sri_Lanka_Puppet.jpg/800px-Sri_Lanka_Puppet.jpg',
'Morning or afternoon — any time during opening hours is equally good',
'A short but fascinating visit. Photography is usually allowed. A great place to learn about traditional Sri Lankan performing arts.',
'Tuk-tuk from Moratuwa or Dehiwala. About 20 minutes.',
'Indoor museum with smooth flooring. Good wheelchair access.',
'Usually quiet — a hidden gem. Rarely crowded.'),

('Barefoot Gallery', 'Cultural', 19.00,
'A beloved Colombo institution celebrating Sri Lankan arts, crafts and textile design. The shaded garden café is perfect for a relaxed afternoon.',
'10:00 AM – 7:00 PM', 6.9295, 79.8911,
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Barefoot_Gallery_Colombo.jpg/1280px-Barefoot_Gallery_Colombo.jpg',
'Mid-morning to afternoon — relax at the garden café after browsing',
'Perfect for buying handmade gifts and souvenirs. The garden café serves great food. Combine with nearby Galle Face for a full day out in Colombo.',
'Bus to Colombo then tuk-tuk to Galle Road, Colombo 3. About 55 minutes.',
'Ground floor is accessible. Garden has gravel paths so not ideal for wheelchairs.',
'Moderate crowds throughout the week. Busier on weekend afternoons.'),

('Isipathanaramaya Temple', 'Religious', 16.00,
'One of Colombo''s oldest Buddhist temples, believed to be over 2,000 years old. Known for its serene atmosphere and towering white dagoba.',
'5:00 AM – 9:00 PM', 6.8888, 79.8656,
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Isipathanaramaya_Temple.jpg/1280px-Isipathanaramaya_Temple.jpg',
'Early morning (5:00–8:00 AM) — tranquil with the sound of morning chanting',
'Dress modestly and remove shoes. The temple grounds are excellent for quiet reflection. Photography respectfully allowed.',
'Bus to Havelock Town then a short walk. About 40–45 minutes from Moratuwa.',
'Flat paved grounds around the dagoba. Good general accessibility.',
'Quiet and peaceful most days. Busier on poya days with devotees.');

-- Admin account — password: admin123
INSERT INTO users (Name, Email, Password, Role) VALUES
('Admin', 'admin@touristplanner.lk', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uXuhflmtu', 'admin');

-- Sample reviews
INSERT INTO reviews (PlaceID, AuthorName, Rating, Body) VALUES
(1, 'Priya S.', 5, 'Absolutely stunning sunset! The beach is clean and the food stalls are great. Highly recommend visiting in the evening.'),
(1, 'Kamal F.', 4, 'Beautiful beach, gets a bit crowded on weekends but still worth visiting. The view from the hotel cliff is amazing.'),
(5, 'Amara T.', 5, 'Gangaramaya is unlike any other temple. The museum inside is fascinating — so much history packed in one place.'),
(8, 'Ravi N.', 5, 'The National Museum is a treasure trove of Sri Lankan history. The Kandyan crown and throne are breathtaking.'),
(9, 'Sandra M.', 4, 'Galle Face at sunset is magical. Street food is delicious. Go on a weekday to avoid the weekend crowds.'),
(2, 'Thilini P.', 4, 'My kids loved the elephant show. The zoo is well maintained and very educational. Great family day out.');