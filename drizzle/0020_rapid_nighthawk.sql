CREATE TABLE `commerce_order_delivery_ratings` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`customerId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerce_order_delivery_ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerce_order_delivery_ratings_orderId_unique` UNIQUE(`orderId`)
);
