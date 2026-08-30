CREATE TABLE `product_availability_requests` (
	`id` varchar(64) NOT NULL,
	`requestedProduct` varchar(255) NOT NULL,
	`sourceProductId` varchar(64),
	`requesterName` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`city` varchar(120),
	`quantity` varchar(120),
	`notes` text,
	`status` enum('new','contacted','sourcing','fulfilled','closed') NOT NULL DEFAULT 'new',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_availability_requests_id` PRIMARY KEY(`id`)
);
