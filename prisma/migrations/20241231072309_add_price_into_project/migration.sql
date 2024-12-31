/*
  Warnings:

  - Made the column `price` on table `project_details` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "project_details" ALTER COLUMN "price" SET NOT NULL;
