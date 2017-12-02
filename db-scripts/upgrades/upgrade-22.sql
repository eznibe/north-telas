-- New design list and prevision fields

ALTER TABLE previsions add column designer varchar(32);

ALTER TABLE previsions add column designWeek int;

ALTER TABLE previsions add column designHours decimal(4,1);

ALTER TABLE previsions add column designOnly boolean default false;

ALTER TABLE previsions add column designOnlyCloth varchar(256);

-- ALTER TABLE previsions add column canvas boolean default false;


ALTER TABLE previsionfulllogs add column designer varchar(32);

ALTER TABLE previsionfulllogs add column designWeek int;

ALTER TABLE previsionfulllogs add column designHours decimal(4,1);

ALTER TABLE previsionfulllogs add column designOnly boolean default false;

ALTER TABLE previsionfulllogs add column designOnlyCloth varchar(256);

-- ALTER TABLE previsionfulllogs add column canvas boolean default false;

-- design coefficient for design hours calculation

alter table sails add column designMinutes numeric;

update sails set designMinutes = 120 where id = 30;
update sails set designMinutes = 132 where id = 31;
update sails set designMinutes = 144 where id = 32;
update sails set designMinutes = 144 where id = 33;
update sails set designMinutes = 144 where id = 34;
update sails set designMinutes = 96 where id = 35;
update sails set designMinutes = 96 where id = 36;
update sails set designMinutes = 48 where id = 37;

update sails set designMinutes = 90 where sailGroupId = 2;
update sails set designMinutes = 72 where id = 45;
update sails set designMinutes = 72 where id = 47;

update sails set designMinutes = 90 where sailGroupId = 3;

update sails set designMinutes = 90 where sailGroupId = 5;

update sails set designMinutes = 60 where sailGroupId = 6;

update sails set designMinutes = 120 where sailGroupId = 7;
update sails set designMinutes = 60 where id = 92;
