-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "ringerWire" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "SoundQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soundId" TEXT NOT NULL,
    "order" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SoundQueue_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "Sound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");
