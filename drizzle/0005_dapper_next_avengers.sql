CREATE TABLE `vendor_notifications` (
	`id` varchar(64) NOT NULL,
	`vendorId` varchar(64) NOT NULL,
	`type` enum('product_question') NOT NULL DEFAULT 'product_question',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`productId` varchar(64) NOT NULL,
	`questionId` varchar(64) NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_notifications_id` PRIMARY KEY(`id`)
);
