-- CreateTable
CREATE TABLE "GameMapping" (
    "id" SERIAL NOT NULL,
    "rawgId" INTEGER NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCache" (
    "slug" TEXT NOT NULL,
    "gameData" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCache_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameMapping_rawgId_key" ON "GameMapping"("rawgId");
