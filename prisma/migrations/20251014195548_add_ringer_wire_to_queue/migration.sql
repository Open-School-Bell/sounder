-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SoundQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soundId" TEXT NOT NULL,
    "order" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ringerWire" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SoundQueue_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "Sound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SoundQueue" ("id", "order", "soundId") SELECT "id", "order", "soundId" FROM "SoundQueue";
DROP TABLE "SoundQueue";
ALTER TABLE "new_SoundQueue" RENAME TO "SoundQueue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
