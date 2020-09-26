
alter table previsions add column excludeAutoUpdateDeliveryDate boolean default false;

alter table previsionfulllogs add column excludeAutoUpdateDeliveryDate boolean default false;