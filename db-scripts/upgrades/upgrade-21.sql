
ALTER TABLE previsions add column deliveryDateManuallyUpdated boolean default false;

alter table previsionfulllogs add column deliveryDateManuallyUpdated boolean;


ALTER TABLE previsions add column excludeFromStateCalculation boolean default false;

alter table previsionfulllogs add column excludeFromStateCalculation boolean;
