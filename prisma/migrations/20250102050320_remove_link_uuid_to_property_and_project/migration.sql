/*
  Warnings:

  - You are about to drop the column `link_uuid` on the `project_details` table. All the data in the column will be lost.
  - You are about to drop the column `link_uuid` on the `property_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_details" DROP COLUMN "link_uuid";

-- AlterTable
ALTER TABLE "property_details" DROP COLUMN "link_uuid";
