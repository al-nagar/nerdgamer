/*
  Warnings:

  - You are about to drop the `GameMapping` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rawgId]` on the table `GameCache` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GameCache" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "igdbId" INTEGER,
ADD COLUMN     "rawgId" INTEGER;

-- DropTable
DROP TABLE "GameMapping";

-- CreateIndex
CREATE UNIQUE INDEX "GameCache_rawgId_key" ON "GameCache"("rawgId");
