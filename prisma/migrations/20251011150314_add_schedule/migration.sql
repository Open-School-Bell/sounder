-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" TEXT NOT NULL,
    "weekDays" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "day" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    CONSTRAINT "Schedule_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "Sound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
