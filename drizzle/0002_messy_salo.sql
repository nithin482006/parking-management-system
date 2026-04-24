ALTER TABLE `bookings` ADD `completionCode` varchar(20);--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_completionCode_unique` UNIQUE(`completionCode`);