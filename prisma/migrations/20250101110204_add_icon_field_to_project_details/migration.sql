/*
  Warnings:

  - The `picture` column on the `project_details` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "project_details" ADD COLUMN     "icon" VARCHAR,
DROP COLUMN "picture",
ADD COLUMN     "picture" TEXT[];
