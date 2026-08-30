CREATE TABLE `produce_quote_notifications` (
	`id` varchar(64) NOT NULL,
	`quoteRequestId` varchar(64) NOT NULL,
	`recipientId` int NOT NULL,
	`actorId` int NOT NULL,
	`type` enum('status_change','new_message','new_request') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `produce_quote_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `produce_quote_messages` ADD COLUMN `readAt` timestamp;
ALTER TABLE `produce_quote_messages` ADD `readAt` timestamp;
