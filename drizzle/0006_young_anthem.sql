ALTER TABLE `product_questions` ADD `vendorNotificationDelivered` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `product_questions` ADD `vendorNotifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `product_questions` ADD `vendorNotificationError` varchar(500);