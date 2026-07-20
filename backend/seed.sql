INSERT INTO programs (name, university, cost, duration_months, location, tags) VALUES
('Korean Language Program', 'Yonsei University', 1200000, 6, 'Sinchon', ARRAY['language', 'seoul']),
('Global Business Exchange', 'Korea University', 2800000, 6, 'Anam', ARRAY['business', 'exchange']),
('STEM Exchange Semester', 'Seoul National University', 3200000, 4, 'Gwanak', ARRAY['stem', 'research']),
('K-Culture & Media Studies', 'Ewha Womans University', 1800000, 6, 'Sinchon', ARRAY['media', 'culture']),
('International Business Program', 'Sungkyunkwan University', 2400000, 6, 'Myeongnyun', ARRAY['business']),
('Computer Science Exchange', 'Hanyang University', 2000000, 4, 'Seongdong', ARRAY['stem', 'tech']);

INSERT INTO housing_options (type, monthly_cost, location, lifestyle_fit) VALUES
('Goshiwon', 450000, 'Sinchon', 'budget, solo, minimal space'),
('Sharehouse', 700000, 'Hongdae', 'social, shared kitchen, nightlife nearby'),
('Studio', 1100000, 'Gangnam', 'private, quiet, higher budget');