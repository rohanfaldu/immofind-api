/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `project_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "project_details" ALTER COLUMN "slug" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "project_details_slug_key" ON "project_details"("slug");
