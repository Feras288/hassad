CREATE TABLE `product_questions` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`vendorId` varchar(64) NOT NULL,
	`vendorName` varchar(255) NOT NULL,
	`askerName` varchar(160) NOT NULL,
	`question` text NOT NULL,
	`answer` text,
	`answererName` varchar(160),
	`status` enum('pending','answered','hidden') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`answeredAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','vendor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `vendorId` varchar(64);