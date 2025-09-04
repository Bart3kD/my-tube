/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `videos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."playlists" DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."videos" DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnailUrl" TEXT;
