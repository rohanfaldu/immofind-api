/*
  Warnings:

  - The `description` column on the `developers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `serviceArea` column on the `developers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "developers" DROP COLUMN "description",
ADD COLUMN     "description" UUID,
DROP COLUMN "serviceArea",
ADD COLUMN     "serviceArea" UUID;

-- AddForeignKey
ALTER TABLE "developers" ADD CONSTRAINT "developers_description_fkey" FOREIGN KEY ("description") REFERENCES "lang_translations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "developers" ADD CONSTRAINT "developers_serviceArea_fkey" FOREIGN KEY ("serviceArea") REFERENCES "lang_translations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
