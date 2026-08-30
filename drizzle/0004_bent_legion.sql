CREATE TABLE `product_question_feedback` (
	`id` varchar(160) NOT NULL,
	`questionId` varchar(64) NOT NULL,
	`feedbackToken` varchar(64) NOT NULL,
	`isHelpful` boolean NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_question_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_questions` ADD `helpfulCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_questions` ADD `notHelpfulCount` int DEFAULT 0 NOT NULL;