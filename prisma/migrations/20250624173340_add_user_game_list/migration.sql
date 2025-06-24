-- CreateTable
CREATE TABLE "UserGameList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameList_userId_gameSlug_status_key" ON "UserGameList"("userId", "gameSlug", "status");

-- AddForeignKey
ALTER TABLE "UserGameList" ADD CONSTRAINT "UserGameList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameList" ADD CONSTRAINT "UserGameList_gameSlug_fkey" FOREIGN KEY ("gameSlug") REFERENCES "GameCache"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
