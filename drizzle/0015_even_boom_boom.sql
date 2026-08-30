CREATE TABLE `admin_vendor_profiles` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('supplier','provider') NOT NULL DEFAULT 'supplier',
	`category` varchar(160) NOT NULL,
	`status` enum('active','inactive','pending','suspended') NOT NULL DEFAULT 'pending',
	`verified` boolean NOT NULL DEFAULT false,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`location` varchar(160) NOT NULL,
	`logoUrl` text,
	`commission` int NOT NULL DEFAULT 0,
	`description` text,
	`website` varchar(500),
	`crNumber` varchar(120),
	`vatNumber` varchar(120),
	`bankName` varchar(160),
	`bankIban` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_vendor_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_categories` (
	`id` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`icon` varchar(32) NOT NULL DEFAULT '🌿',
	`color` varchar(16) NOT NULL DEFAULT '#4CAF50',
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_categories_id` PRIMARY KEY(`id`)
);
