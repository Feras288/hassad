CREATE TABLE `commerce_order_items` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(120) NOT NULL,
	`image` text,
	`unit` varchar(120) NOT NULL,
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commerce_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commerce_order_tracking_events` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commerce_order_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commerce_orders` (
	`id` varchar(64) NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`customerId` int,
	`customerName` varchar(160) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`customerEmail` varchar(320),
	`vendorId` varchar(64) NOT NULL,
	`vendorName` varchar(255) NOT NULL,
	`deliveryAddress` json NOT NULL,
	`paymentMethod` varchar(64) NOT NULL,
	`subtotal` int NOT NULL,
	`discount` int NOT NULL DEFAULT 0,
	`shippingCost` int NOT NULL DEFAULT 0,
	`vat` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(120),
	`shippingProvider` varchar(160),
	`estimatedDelivery` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerce_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerce_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `customer_order_notifications` (
	`id` varchar(64) NOT NULL,
	`customerId` int NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`type` enum('order_status','shipment_update') NOT NULL DEFAULT 'order_status',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_order_notifications_id` PRIMARY KEY(`id`)
);
