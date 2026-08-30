CREATE TABLE `service_bookings` (
	`id` varchar(64) NOT NULL,
	`customerId` int NOT NULL,
	`providerId` varchar(96) NOT NULL,
	`providerName` varchar(255) NOT NULL,
	`providerAvatar` text,
	`serviceType` varchar(120) NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`serviceOfferId` varchar(96),
	`packageName` varchar(255) NOT NULL,
	`packagePrice` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` varchar(120),
	`location` text NOT NULL,
	`farmSize` varchar(96),
	`notes` text,
	`contactName` varchar(160) NOT NULL,
	`contactPhone` varchar(32) NOT NULL,
	`paymentMethod` enum('card','transfer','cash') NOT NULL DEFAULT 'cash',
	`status` enum('requested','confirmed','completed','cancelled','declined') NOT NULL DEFAULT 'requested',
	`providerNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_conversation_messages` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`senderId` int NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_conversations` (
	`id` varchar(64) NOT NULL,
	`customerId` int NOT NULL,
	`providerId` varchar(96) NOT NULL,
	`providerName` varchar(255) NOT NULL,
	`providerAvatar` text,
	`subject` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_conversations_id` PRIMARY KEY(`id`)
);
