/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[oauth_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `email` VARCHAR(255) NOT NULL,
    ADD COLUMN `oauth_id` VARCHAR(255) NULL,
    ADD COLUMN `oauth_provider` VARCHAR(50) NULL,
    ADD COLUMN `password` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `user_oauth_id_key` ON `user`(`oauth_id`);
