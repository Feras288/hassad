CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ipAddress` text,
	`userAgent` text,
	`userId` varchar(64) NOT NULL,
	`impersonatedBy` text,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` varchar(64) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`providerId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` timestamp,
	`refreshTokenExpiresAt` timestamp,
	`scope` text,
	`password` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(64) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(255) NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `emailVerified` boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `image` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `banned` boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `banReason` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `banExpires` timestamp;
--> statement-breakpoint
ALTER TABLE `business_buyer_profiles` MODIFY COLUMN `userId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `business_buyer_profiles` MODIFY COLUMN `reviewedBy` varchar(64);
--> statement-breakpoint
ALTER TABLE `produce_listings` MODIFY COLUMN `farmerId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `produce_quote_requests` MODIFY COLUMN `buyerId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `produce_quote_messages` MODIFY COLUMN `senderId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `produce_quote_notifications` MODIFY COLUMN `recipientId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `produce_quote_notifications` MODIFY COLUMN `actorId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `service_bookings` MODIFY COLUMN `customerId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `service_conversations` MODIFY COLUMN `customerId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `service_conversation_messages` MODIFY COLUMN `senderId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `admin_notification_reads` MODIFY COLUMN `adminUserId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_orders` MODIFY COLUMN `customerId` varchar(64);
--> statement-breakpoint
ALTER TABLE `customer_order_notifications` MODIFY COLUMN `customerId` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_order_delivery_ratings` MODIFY COLUMN `customerId` varchar(64) NOT NULL;
