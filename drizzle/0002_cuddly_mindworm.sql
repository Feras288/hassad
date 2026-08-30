CREATE TABLE `product_availability_request_matches` (
	`id` varchar(64) NOT NULL,
	`requestId` varchar(64) NOT NULL,
	`vendorId` varchar(64) NOT NULL,
	`vendorName` varchar(255) NOT NULL,
	`vendorEmail` varchar(320) NOT NULL,
	`vendorPhone` varchar(32) NOT NULL,
	`vendorLocation` varchar(120) NOT NULL,
	`vendorCategory` varchar(160) NOT NULL,
	`matchScore` int NOT NULL,
	`matchReason` varchar(500) NOT NULL,
	`status` enum('suggested','contacted','accepted','declined') NOT NULL DEFAULT 'suggested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_availability_request_matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_availability_requests` ADD `ownerNotificationDelivered` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `product_availability_requests` ADD `ownerNotifiedAt` timestamp;