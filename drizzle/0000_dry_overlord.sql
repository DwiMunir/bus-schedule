CREATE TABLE `bus_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`period_id` integer NOT NULL,
	`terminal_id` integer NOT NULL,
	`operator_id` integer NOT NULL,
	`route_id` integer NOT NULL,
	`service_type_code` text NOT NULL,
	`fare_min` integer,
	`fare_max` integer,
	`fare_text` text NOT NULL,
	`distance_text` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `schedule_periods`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`terminal_id`) REFERENCES `terminals`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`operator_id`) REFERENCES `operators`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`service_type_code`) REFERENCES `service_types`(`code`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bus_services_period_operator_route_service_unique` ON `bus_services` (`period_id`,`operator_id`,`route_id`,`service_type_code`);--> statement-breakpoint
CREATE INDEX `bus_services_public_filter_idx` ON `bus_services` (`period_id`,`service_type_code`);--> statement-breakpoint
CREATE INDEX `bus_services_operator_idx` ON `bus_services` (`operator_id`);--> statement-breakpoint
CREATE INDEX `bus_services_route_idx` ON `bus_services` (`route_id`);--> statement-breakpoint
CREATE TABLE `departure_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bus_service_id` integer NOT NULL,
	`departure_time` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bus_service_id`) REFERENCES `bus_services`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "departure_schedules_time_check" CHECK("departure_schedules"."departure_time" glob '[0-2][0-9]:[0-5][0-9]')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departure_schedules_service_time_unique` ON `departure_schedules` (`bus_service_id`,`departure_time`);--> statement-breakpoint
CREATE INDEX `departure_schedules_service_order_idx` ON `departure_schedules` (`bus_service_id`,`sort_order`,`departure_time`);--> statement-breakpoint
CREATE TABLE `import_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_file` text NOT NULL,
	`source_sheet` text,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`row_count` integer,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `operators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operators_name_unique` ON `operators` (`name`);--> statement-breakpoint
CREATE TABLE `routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_text` text NOT NULL,
	`origin_name` text,
	`destination_name` text,
	`distance_km` real,
	`distance_text` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routes_route_text_unique` ON `routes` (`route_text`);--> statement-breakpoint
CREATE INDEX `routes_origin_destination_idx` ON `routes` (`origin_name`,`destination_name`);--> statement-breakpoint
CREATE TABLE `schedule_periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`terminal_id` integer NOT NULL,
	`import_source_id` integer,
	`name` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`starts_on` text,
	`ends_on` text,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`terminal_id`) REFERENCES `terminals`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`import_source_id`) REFERENCES `import_sources`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "schedule_periods_month_check" CHECK("schedule_periods"."month" between 1 and 12)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schedule_periods_terminal_month_year_unique` ON `schedule_periods` (`terminal_id`,`month`,`year`);--> statement-breakpoint
CREATE INDEX `schedule_periods_published_idx` ON `schedule_periods` (`is_published`);--> statement-breakpoint
CREATE TABLE `service_types` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	CONSTRAINT "service_types_code_check" CHECK("service_types"."code" in ('AKAP', 'AKDP'))
);
--> statement-breakpoint
CREATE TABLE `terminals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`city` text,
	`regency` text,
	`province` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terminals_name_unique` ON `terminals` (`name`);