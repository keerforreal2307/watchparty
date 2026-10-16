CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rooms_expiry_idx` ON `rooms` (`expires_at`);