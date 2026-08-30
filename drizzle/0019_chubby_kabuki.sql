CREATE TABLE `vendor_order_notifications` (
	`id` varchar(64) NOT NULL,
	`vendorId` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`type` enum('cancellation_request') NOT NULL DEFAULT 'cancellation_request',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_order_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `cancellationStatus` enum('none','requested','approved','rejected') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `cancellationReason` text;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `cancellationRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `cancellationResolvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `cancellationResponse` text;