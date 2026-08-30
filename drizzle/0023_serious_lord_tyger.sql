CREATE TABLE `business_buyer_profiles` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`businessType` enum('company','trader','restaurant') NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`contactName` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`crNumber` varchar(120),
	`vatNumber` varchar(120),
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_buyer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_buyer_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `produce_listings` (
	`id` varchar(64) NOT NULL,
	`farmerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`cropType` varchar(120) NOT NULL,
	`variety` varchar(160),
	`grade` varchar(120),
	`location` varchar(160) NOT NULL,
	`harvestDate` timestamp,
	`availableQuantity` int NOT NULL,
	`unit` varchar(48) NOT NULL DEFAULT 'كجم',
	`minOrderQuantity` int NOT NULL DEFAULT 1,
	`priceMode` enum('request_quote','visible_to_b2b') NOT NULL DEFAULT 'request_quote',
	`wholesalePrice` int,
	`description` text,
	`images` json NOT NULL,
	`status` enum('draft','published','paused','sold_out','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produce_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produce_quote_messages` (
	`id` varchar(64) NOT NULL,
	`quoteRequestId` varchar(64) NOT NULL,
	`senderId` int NOT NULL,
	`message` text NOT NULL,
	`proposedUnitPrice` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `produce_quote_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produce_quote_requests` (
	`id` varchar(64) NOT NULL,
	`listingId` varchar(64) NOT NULL,
	`buyerId` int NOT NULL,
	`requestedQuantity` int NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','negotiating','accepted','rejected','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produce_quote_requests_id` PRIMARY KEY(`id`)
);
