ALTER TABLE `content_articles` MODIFY COLUMN `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `adminReply` text;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `handledBy` varchar(160);--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `respondedAt` timestamp;