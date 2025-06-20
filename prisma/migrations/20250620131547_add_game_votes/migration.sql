-- AlterTable
ALTER TABLE "GameCache" ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GameVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameVote_userId_gameSlug_key" ON "GameVote"("userId", "gameSlug");

-- AddForeignKey
ALTER TABLE "GameVote" ADD CONSTRAINT "GameVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameVote" ADD CONSTRAINT "GameVote_gameSlug_fkey" FOREIGN KEY ("gameSlug") REFERENCES "GameCache"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
