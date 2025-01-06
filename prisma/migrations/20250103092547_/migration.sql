/*
  Warnings:

  - Made the column `latitude` on table `property_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `property_details` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "property_details" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "latitude" SET DATA TYPE VARCHAR,
ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "longitude" SET DATA TYPE VARCHAR;
