CREATE TABLE IF NOT EXISTS `carshowroom_dealerships` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `balance` INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `carshowroom_listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership` VARCHAR(50) NOT NULL,
  `vehicle_model` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `retail_price` INT NOT NULL,
  `wholesale_price` INT NOT NULL,
  `class` VARCHAR(30) NOT NULL,
  `description` TEXT,
  `allow_testdrive` TINYINT(1) NOT NULL DEFAULT 0,
  `floor_stock` INT NOT NULL DEFAULT 0,
  `warehouse_stock` INT NOT NULL DEFAULT 0,
  `floor_slot` INT NULL,
  UNIQUE KEY `dealership_model` (`dealership`, `vehicle_model`)
);

CREATE TABLE IF NOT EXISTS `carshowroom_units` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `dealership` VARCHAR(50) NOT NULL,
  `location` ENUM('truck','warehouse','floor','sold') NOT NULL DEFAULT 'truck',
  `warehouse_slot` INT NULL,
  `mods_json` TEXT NULL,
  `plate` VARCHAR(12) NULL,
  `owner_citizenid` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`listing_id`) REFERENCES `carshowroom_listings`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `carshowroom_employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership` VARCHAR(50) NOT NULL,
  `citizenid` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `salary` INT NOT NULL DEFAULT 0,
  `can_buy_stock` TINYINT(1) NOT NULL DEFAULT 0,
  `can_manage_floor` TINYINT(1) NOT NULL DEFAULT 0,
  `can_finance` TINYINT(1) NOT NULL DEFAULT 0,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `dealership_citizen` (`dealership`, `citizenid`)
);

CREATE TABLE IF NOT EXISTS `carshowroom_finance_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership` VARCHAR(50) NOT NULL,
  `citizenid` VARCHAR(50) NULL,
  `action` VARCHAR(30) NOT NULL, -- deposit | withdraw | sale | restock | salary
  `amount` INT NOT NULL,
  `note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `carshowroom_upgrades` (
  `dealership` VARCHAR(50) NOT NULL PRIMARY KEY,
  `truck_unlocked` TINYINT(1) NOT NULL DEFAULT 0
);

INSERT IGNORE INTO `carshowroom_dealerships` (`id`, `balance`) VALUES
  ('muzaffar', 0), ('sandyshore', 0), ('alkutub', 0);

INSERT IGNORE INTO `carshowroom_upgrades` (`dealership`, `truck_unlocked`) VALUES
  ('muzaffar', 0), ('sandyshore', 0), ('alkutub', 0);
