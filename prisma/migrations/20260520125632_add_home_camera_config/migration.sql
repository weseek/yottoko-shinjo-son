-- CreateTable
CREATE TABLE "home_camera_configs" (
    "id" SERIAL NOT NULL,
    "label" TEXT,
    "scale" DOUBLE PRECISION,
    "arAssetUrl" TEXT,
    "mindFileUrl" TEXT,
    "markerImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_camera_configs_pkey" PRIMARY KEY ("id")
);
