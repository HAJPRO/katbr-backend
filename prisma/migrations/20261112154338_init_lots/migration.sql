-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "lots" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "status" "LotStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);
