CREATE TABLE `vendor_notification_preferences` (
	`vendorId` varchar(64) NOT NULL,
	`productQuestionEnabled` boolean NOT NULL DEFAULT true,
	`inAppToastEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_notification_preferences_vendorId` PRIMARY KEY(`vendorId`)
);
