/*
  Warnings:

  - You are about to drop the column `postId` on the `PostExtra` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostExtra" DROP CONSTRAINT "PostExtra_postId_fkey";

-- DropIndex
DROP INDEX "PostExtra_postId_key";

-- AlterTable
ALTER TABLE "PostExtra" DROP COLUMN "postId";
