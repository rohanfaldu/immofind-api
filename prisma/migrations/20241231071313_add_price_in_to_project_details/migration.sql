/*
  Warnings:

  - Added the required column `price` to the `project_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_details" ADD COLUMN     "currency_id" UUID,
ADD COLUMN  "price" INTEGER;

-- AddForeignKey
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
