-- CreateTable
CREATE TABLE "brokers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_brokers" (
    "organizationId" UUID NOT NULL,
    "brokerId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_brokers_pkey" PRIMARY KEY ("organizationId","brokerId")
);

-- AddForeignKey
ALTER TABLE "organization_brokers" ADD CONSTRAINT "organization_brokers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_brokers" ADD CONSTRAINT "organization_brokers_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
