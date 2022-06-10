/*
  Warnings:

  - A unique constraint covering the columns `[symbol]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Watchlist_symbol_key` ON `Watchlist`(`symbol`);
