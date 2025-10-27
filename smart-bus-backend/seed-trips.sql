-- Seed data for Tunisia bus trips
-- Major cities: Tunis, Sfax, Sousse, Bizerte, Gabès, Kairouan, Nabeul, Monastir

USE smartbus;

-- Tunis → Sfax (270 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Sfax', '06:00:00', '09:30:00', 210, 25.00, 40, 'standard'),
('Tunis', 'Sfax', '08:30:00', '12:00:00', 210, 25.00, 40, 'standard'),
('Tunis', 'Sfax', '11:00:00', '14:15:00', 195, 30.00, 35, 'express'),
('Tunis', 'Sfax', '14:00:00', '17:30:00', 210, 25.00, 40, 'standard'),
('Tunis', 'Sfax', '17:30:00', '21:00:00', 210, 25.00, 40, 'standard'),
('Tunis', 'Sfax', '20:00:00', '23:30:00', 210, 28.00, 30, 'luxury');

-- Tunis → Sousse (140 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Sousse', '06:30:00', '08:30:00', 120, 15.00, 40, 'standard'),
('Tunis', 'Sousse', '09:00:00', '11:00:00', 120, 15.00, 40, 'standard'),
('Tunis', 'Sousse', '12:00:00', '13:45:00', 105, 18.00, 35, 'express'),
('Tunis', 'Sousse', '15:00:00', '17:00:00', 120, 15.00, 40, 'standard'),
('Tunis', 'Sousse', '18:00:00', '20:00:00', 120, 15.00, 40, 'standard'),
('Tunis', 'Sousse', '21:00:00', '22:45:00', 105, 20.00, 30, 'luxury');

-- Tunis → Bizerte (65 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Bizerte', '07:00:00', '08:15:00', 75, 8.00, 40, 'standard'),
('Tunis', 'Bizerte', '10:00:00', '11:15:00', 75, 8.00, 40, 'standard'),
('Tunis', 'Bizerte', '13:00:00', '14:10:00', 70, 10.00, 35, 'express'),
('Tunis', 'Bizerte', '16:00:00', '17:15:00', 75, 8.00, 40, 'standard'),
('Tunis', 'Bizerte', '19:00:00', '20:15:00', 75, 8.00, 40, 'standard');

-- Tunis → Gabès (405 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Gabès', '05:30:00', '11:00:00', 330, 35.00, 40, 'standard'),
('Tunis', 'Gabès', '10:00:00', '15:15:00', 315, 40.00, 35, 'express'),
('Tunis', 'Gabès', '15:00:00', '20:30:00', 330, 35.00, 40, 'standard'),
('Tunis', 'Gabès', '22:00:00', '03:30:00', 330, 45.00, 30, 'luxury');

-- Tunis → Kairouan (160 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Kairouan', '07:00:00', '09:30:00', 150, 12.00, 40, 'standard'),
('Tunis', 'Kairouan', '11:00:00', '13:15:00', 135, 15.00, 35, 'express'),
('Tunis', 'Kairouan', '15:00:00', '17:30:00', 150, 12.00, 40, 'standard'),
('Tunis', 'Kairouan', '19:00:00', '21:30:00', 150, 12.00, 40, 'standard');

-- Tunis → Nabeul (65 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Nabeul', '06:30:00', '07:45:00', 75, 7.00, 40, 'standard'),
('Tunis', 'Nabeul', '09:30:00', '10:45:00', 75, 7.00, 40, 'standard'),
('Tunis', 'Nabeul', '13:00:00', '14:10:00', 70, 9.00, 35, 'express'),
('Tunis', 'Nabeul', '16:30:00', '17:45:00', 75, 7.00, 40, 'standard'),
('Tunis', 'Nabeul', '20:00:00', '21:15:00', 75, 7.00, 40, 'standard');

-- Tunis → Monastir (162 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Tunis', 'Monastir', '07:00:00', '09:30:00', 150, 16.00, 40, 'standard'),
('Tunis', 'Monastir', '12:00:00', '14:15:00', 135, 18.00, 35, 'express'),
('Tunis', 'Monastir', '17:00:00', '19:30:00', 150, 16.00, 40, 'standard');

-- Sfax → Tunis (270 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sfax', 'Tunis', '05:00:00', '08:30:00', 210, 25.00, 40, 'standard'),
('Sfax', 'Tunis', '08:00:00', '11:30:00', 210, 25.00, 40, 'standard'),
('Sfax', 'Tunis', '11:00:00', '14:15:00', 195, 30.00, 35, 'express'),
('Sfax', 'Tunis', '14:00:00', '17:30:00', 210, 25.00, 40, 'standard'),
('Sfax', 'Tunis', '18:00:00', '21:30:00', 210, 25.00, 40, 'standard'),
('Sfax', 'Tunis', '21:00:00', '00:30:00', 210, 28.00, 30, 'luxury');

-- Sfax → Sousse (128 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sfax', 'Sousse', '06:00:00', '08:00:00', 120, 14.00, 40, 'standard'),
('Sfax', 'Sousse', '10:00:00', '12:00:00', 120, 14.00, 40, 'standard'),
('Sfax', 'Sousse', '14:00:00', '15:45:00', 105, 16.00, 35, 'express'),
('Sfax', 'Sousse', '18:00:00', '20:00:00', 120, 14.00, 40, 'standard');

-- Sfax → Gabès (135 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sfax', 'Gabès', '07:00:00', '09:15:00', 135, 13.00, 40, 'standard'),
('Sfax', 'Gabès', '11:00:00', '13:00:00', 120, 15.00, 35, 'express'),
('Sfax', 'Gabès', '15:00:00', '17:15:00', 135, 13.00, 40, 'standard'),
('Sfax', 'Gabès', '19:00:00', '21:15:00', 135, 13.00, 40, 'standard');

-- Sousse → Tunis (140 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sousse', 'Tunis', '05:30:00', '07:30:00', 120, 15.00, 40, 'standard'),
('Sousse', 'Tunis', '08:00:00', '10:00:00', 120, 15.00, 40, 'standard'),
('Sousse', 'Tunis', '11:00:00', '12:45:00', 105, 18.00, 35, 'express'),
('Sousse', 'Tunis', '14:00:00', '16:00:00', 120, 15.00, 40, 'standard'),
('Sousse', 'Tunis', '17:00:00', '19:00:00', 120, 15.00, 40, 'standard'),
('Sousse', 'Tunis', '20:00:00', '21:45:00', 105, 20.00, 30, 'luxury');

-- Sousse → Sfax (128 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sousse', 'Sfax', '06:00:00', '08:00:00', 120, 14.00, 40, 'standard'),
('Sousse', 'Sfax', '10:00:00', '12:00:00', 120, 14.00, 40, 'standard'),
('Sousse', 'Sfax', '14:00:00', '15:45:00', 105, 16.00, 35, 'express'),
('Sousse', 'Sfax', '18:00:00', '20:00:00', 120, 14.00, 40, 'standard');

-- Sousse → Kairouan (57 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Sousse', 'Kairouan', '07:00:00', '08:00:00', 60, 6.00, 40, 'standard'),
('Sousse', 'Kairouan', '11:00:00', '12:00:00', 60, 6.00, 40, 'standard'),
('Sousse', 'Kairouan', '15:00:00', '16:00:00', 60, 6.00, 40, 'standard'),
('Sousse', 'Kairouan', '19:00:00', '20:00:00', 60, 6.00, 40, 'standard');

-- Bizerte → Tunis (65 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Bizerte', 'Tunis', '06:00:00', '07:15:00', 75, 8.00, 40, 'standard'),
('Bizerte', 'Tunis', '09:00:00', '10:15:00', 75, 8.00, 40, 'standard'),
('Bizerte', 'Tunis', '12:00:00', '13:10:00', 70, 10.00, 35, 'express'),
('Bizerte', 'Tunis', '15:00:00', '16:15:00', 75, 8.00, 40, 'standard'),
('Bizerte', 'Tunis', '18:00:00', '19:15:00', 75, 8.00, 40, 'standard');

-- Gabès → Tunis (405 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Gabès', 'Tunis', '05:00:00', '10:30:00', 330, 35.00, 40, 'standard'),
('Gabès', 'Tunis', '10:00:00', '15:15:00', 315, 40.00, 35, 'express'),
('Gabès', 'Tunis', '15:00:00', '20:30:00', 330, 35.00, 40, 'standard'),
('Gabès', 'Tunis', '21:00:00', '02:30:00', 330, 45.00, 30, 'luxury');

-- Gabès → Sfax (135 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Gabès', 'Sfax', '06:00:00', '08:15:00', 135, 13.00, 40, 'standard'),
('Gabès', 'Sfax', '10:00:00', '12:00:00', 120, 15.00, 35, 'express'),
('Gabès', 'Sfax', '14:00:00', '16:15:00', 135, 13.00, 40, 'standard'),
('Gabès', 'Sfax', '18:00:00', '20:15:00', 135, 13.00, 40, 'standard');

-- Kairouan → Tunis (160 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Kairouan', 'Tunis', '06:00:00', '08:30:00', 150, 12.00, 40, 'standard'),
('Kairouan', 'Tunis', '10:00:00', '12:15:00', 135, 15.00, 35, 'express'),
('Kairouan', 'Tunis', '14:00:00', '16:30:00', 150, 12.00, 40, 'standard'),
('Kairouan', 'Tunis', '18:00:00', '20:30:00', 150, 12.00, 40, 'standard');

-- Kairouan → Sousse (57 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Kairouan', 'Sousse', '06:00:00', '07:00:00', 60, 6.00, 40, 'standard'),
('Kairouan', 'Sousse', '10:00:00', '11:00:00', 60, 6.00, 40, 'standard'),
('Kairouan', 'Sousse', '14:00:00', '15:00:00', 60, 6.00, 40, 'standard'),
('Kairouan', 'Sousse', '18:00:00', '19:00:00', 60, 6.00, 40, 'standard');

-- Nabeul → Tunis (65 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Nabeul', 'Tunis', '06:00:00', '07:15:00', 75, 7.00, 40, 'standard'),
('Nabeul', 'Tunis', '09:00:00', '10:15:00', 75, 7.00, 40, 'standard'),
('Nabeul', 'Tunis', '12:00:00', '13:10:00', 70, 9.00, 35, 'express'),
('Nabeul', 'Tunis', '15:00:00', '16:15:00', 75, 7.00, 40, 'standard'),
('Nabeul', 'Tunis', '18:00:00', '19:15:00', 75, 7.00, 40, 'standard');

-- Monastir → Tunis (162 km)
INSERT INTO trips (from_city, to_city, departure_time, arrival_time, duration_minutes, price, available_seats, bus_type) VALUES
('Monastir', 'Tunis', '06:00:00', '08:30:00', 150, 16.00, 40, 'standard'),
('Monastir', 'Tunis', '11:00:00', '13:15:00', 135, 18.00, 35, 'express'),
('Monastir', 'Tunis', '16:00:00', '18:30:00', 150, 16.00, 40, 'standard');
