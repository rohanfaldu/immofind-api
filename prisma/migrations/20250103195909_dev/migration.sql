/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `property_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "property_details" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "property_details_slug_key" ON "property_details"("slug");
