CREATE TABLE `admin_notification_reads` (
	`id` varchar(160) NOT NULL,
	`adminUserId` int NOT NULL,
	`notificationKey` varchar(128) NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_notification_reads_id` PRIMARY KEY(`id`)
);
