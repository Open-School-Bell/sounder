/*
  Warnings:

  - You are about to drop the column `count` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `soundId` on the `Schedule` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" TEXT NOT NULL,
    "weekDays" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "sequence" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_Schedule" ("day", "id", "time", "weekDays") SELECT "day", "id", "time", "weekDays" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
