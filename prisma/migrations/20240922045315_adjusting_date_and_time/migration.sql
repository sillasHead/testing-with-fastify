-- AlterTable
ALTER TABLE `order` MODIFY `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `max_time_delivery` TIME NULL,
    MODIFY `min_time_delivery` TIME NULL;
