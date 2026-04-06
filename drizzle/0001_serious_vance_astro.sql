CREATE TABLE `analyticsData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`date` datetime NOT NULL,
	`totalBookings` int DEFAULT 0,
	`completedBookings` int DEFAULT 0,
	`cancelledBookings` int DEFAULT 0,
	`occupancyRate` decimal(5,2) DEFAULT '0',
	`totalRevenue` decimal(12,2) DEFAULT '0',
	`averageBookingDuration` int,
	`peakHour` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`action` enum('created','extended','cancelled','completed','modified') NOT NULL,
	`previousEndTime` datetime,
	`newEndTime` datetime,
	`priceAdjustment` decimal(10,2),
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slotId` int NOT NULL,
	`vehicleId` int NOT NULL,
	`facilityId` int NOT NULL,
	`startTime` datetime NOT NULL,
	`endTime` datetime NOT NULL,
	`status` enum('pending','confirmed','active','completed','cancelled') DEFAULT 'pending',
	`totalPrice` decimal(10,2) NOT NULL,
	`paymentStatus` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
	`bookingReference` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingReference_unique` UNIQUE(`bookingReference`)
);
--> statement-breakpoint
CREATE TABLE `parkingFacilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(100),
	`zipCode` varchar(20),
	`totalSlots` int NOT NULL,
	`description` text,
	`amenities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parkingFacilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parkingSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`slotNumber` varchar(50) NOT NULL,
	`level` varchar(20),
	`type` enum('regular','compact','handicap','premium') DEFAULT 'regular',
	`status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
	`pricePerHour` decimal(10,2) NOT NULL,
	`pricePerDay` decimal(10,2),
	`maxDuration` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parkingSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`dayOfWeek` varchar(20),
	`startTime` varchar(10),
	`endTime` varchar(10),
	`pricePerHour` decimal(10,2) NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licensePlate` varchar(20) NOT NULL,
	`vehicleType` enum('car','motorcycle','truck','van') NOT NULL,
	`color` varchar(50),
	`model` varchar(100),
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);