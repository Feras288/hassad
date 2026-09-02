CREATE INDEX `sessions_user_id_idx` ON `sessions` (`userId`);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`userId`);
--> statement-breakpoint
CREATE INDEX `accounts_provider_id_account_id_idx` ON `accounts` (`providerId`,`accountId`);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_value_idx` ON `verifications` (`identifier`,`value`);
--> statement-breakpoint
CREATE INDEX `produce_listings_status_created_at_idx` ON `produce_listings` (`status`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `produce_listings_farmer_id_updated_at_idx` ON `produce_listings` (`farmerId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `produce_quote_requests_buyer_id_updated_at_idx` ON `produce_quote_requests` (`buyerId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `produce_quote_requests_listing_id_updated_at_idx` ON `produce_quote_requests` (`listingId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `produce_quote_messages_quote_request_id_created_at_idx` ON `produce_quote_messages` (`quoteRequestId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `produce_quote_notifications_recipient_id_created_at_idx` ON `produce_quote_notifications` (`recipientId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `service_bookings_customer_id_scheduled_at_idx` ON `service_bookings` (`customerId`,`scheduledAt`);
--> statement-breakpoint
CREATE INDEX `service_bookings_provider_id_scheduled_at_idx` ON `service_bookings` (`providerId`,`scheduledAt`);
--> statement-breakpoint
CREATE INDEX `service_conversations_customer_id_updated_at_idx` ON `service_conversations` (`customerId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `service_conversations_provider_id_updated_at_idx` ON `service_conversations` (`providerId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `service_conv_msgs_conv_id_created_at_idx` ON `service_conversation_messages` (`conversationId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `admin_vendor_profiles_type_status_verified_created_idx` ON `admin_vendor_profiles` (`type`,`status`,`verified`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `catalog_products_vendor_id_updated_at_idx` ON `catalog_products` (`vendorId`,`updatedAt`);
--> statement-breakpoint
CREATE INDEX `prod_avail_matches_request_id_match_score_idx` ON `product_availability_request_matches` (`requestId`,`matchScore`);
--> statement-breakpoint
CREATE INDEX `product_questions_product_id_status_answered_at_idx` ON `product_questions` (`productId`,`status`,`answeredAt`);
--> statement-breakpoint
CREATE INDEX `vendor_notifications_vendor_id_is_read_created_at_idx` ON `vendor_notifications` (`vendorId`,`isRead`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `admin_notification_reads_admin_user_id_idx` ON `admin_notification_reads` (`adminUserId`);
--> statement-breakpoint
CREATE INDEX `customer_order_notifications_customer_id_created_at_idx` ON `customer_order_notifications` (`customerId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `vendor_order_notifications_vendor_id_created_at_idx` ON `vendor_order_notifications` (`vendorId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `content_articles_status_published_created_idx` ON `content_articles` (`status`,`publishedAt`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `content_articles_status_view_count_published_idx` ON `content_articles` (`status`,`viewCount`,`publishedAt`);
