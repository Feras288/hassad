CREATE TABLE `content_articles` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`coverImage` varchar(1000),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`authorName` varchar(160) NOT NULL,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_articles_id` PRIMARY KEY(`id`)
);
