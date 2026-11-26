-- CreateEnum
CREATE TYPE "LiveClassFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'MONTHLY_TWICE');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LiveRecordingStatus" AS ENUM ('PENDING', 'RECORDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "LiveRecordingVisibility" AS ENUM ('PRIVATE', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "LiveRecordingProvider" AS ENUM ('LIVEKIT_EGRESS', 'OTHER');

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveClassSeries" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "LiveClassFrequency" NOT NULL DEFAULT 'ONE_TIME',
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3),
    "startTimeMinutes" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "weeklyDayOfWeek" INTEGER,
    "monthlyFirstDay" INTEGER,
    "monthlySecondDay" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "courseId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveClassSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "seriesId" INTEGER,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveRecording" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LiveRecordingStatus" NOT NULL DEFAULT 'PENDING',
    "visibility" "LiveRecordingVisibility" NOT NULL DEFAULT 'PRIVATE',
    "provider" "LiveRecordingProvider" NOT NULL DEFAULT 'LIVEKIT_EGRESS',
    "egressId" TEXT,
    "storageKey" TEXT,
    "fileSizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "mimeType" TEXT,
    "courseId" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveAttendance" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER,
    "studentName" TEXT,
    "studentEmail" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "LiveAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "LiveClassSeries_frequency_isActive_idx" ON "LiveClassSeries"("frequency", "isActive");

-- CreateIndex
CREATE INDEX "LiveClassSeries_courseId_idx" ON "LiveClassSeries"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_publicId_key" ON "LiveSession"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_roomName_key" ON "LiveSession"("roomName");

-- CreateIndex
CREATE INDEX "LiveSession_scheduledAt_status_idx" ON "LiveSession"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "LiveSession_seriesId_idx" ON "LiveSession"("seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveRecording_egressId_key" ON "LiveRecording"("egressId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveRecording_storageKey_key" ON "LiveRecording"("storageKey");

-- CreateIndex
CREATE INDEX "LiveRecording_sessionId_idx" ON "LiveRecording"("sessionId");

-- CreateIndex
CREATE INDEX "LiveRecording_courseId_visibility_idx" ON "LiveRecording"("courseId", "visibility");

-- CreateIndex
CREATE INDEX "LiveRecording_status_idx" ON "LiveRecording"("status");

-- CreateIndex
CREATE INDEX "LiveAttendance_sessionId_idx" ON "LiveAttendance"("sessionId");

-- CreateIndex
CREATE INDEX "LiveAttendance_studentId_idx" ON "LiveAttendance"("studentId");

-- AddForeignKey
ALTER TABLE "LiveClassSeries" ADD CONSTRAINT "LiveClassSeries_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "LiveClassSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveRecording" ADD CONSTRAINT "LiveRecording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveRecording" ADD CONSTRAINT "LiveRecording_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveAttendance" ADD CONSTRAINT "LiveAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
