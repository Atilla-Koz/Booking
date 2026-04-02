CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"time_slot" varchar(5) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" varchar(20) DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_date_time_slot_unique" UNIQUE("date","time_slot")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "sessions_day_of_week_start_time_unique" UNIQUE("day_of_week","start_time")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");