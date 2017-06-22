
ALTER TABLE previsions add column deliveryDateManuallyUpdated boolean default false;

alter table previsionfulllogs add column deliveryDateManuallyUpdated boolean;
