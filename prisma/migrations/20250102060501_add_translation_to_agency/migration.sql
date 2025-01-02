/*
  Warnings:

  - The `description` column on the `agencies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `service_area` column on the `agencies` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "agencies" DROP COLUMN "description",
ADD COLUMN     "description" UUID,
DROP COLUMN "service_area",
ADD COLUMN     "service_area" UUID;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_description_fkey" FOREIGN KEY ("description") REFERENCES "lang_translations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_service_area_fkey" FOREIGN KEY ("service_area") REFERENCES "lang_translations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
