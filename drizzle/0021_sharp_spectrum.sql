ALTER TABLE `catalog_products` ADD `shortDescEn` text;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `shortDescEn` text;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `longDescEn` text;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `highlightsEn` json;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `specsEn` json;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `usageInstructionsEn` json;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `certificationsEn` json;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD `tagsEn` json;--> statement-breakpoint
ALTER TABLE `content_articles` ADD `titleEn` varchar(255);--> statement-breakpoint
ALTER TABLE `content_articles` ADD `excerptEn` text;--> statement-breakpoint
ALTER TABLE `content_articles` ADD `contentEn` text;--> statement-breakpoint
ALTER TABLE `content_articles` ADD `categoryEn` varchar(120);--> statement-breakpoint
ALTER TABLE `content_articles` ADD `tagsEn` json;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('ar','en') DEFAULT 'ar' NOT NULL;
