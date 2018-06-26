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

--

alter table properties add column properties.from decimal(6,2);
alter table properties add column properties.to decimal(6,2);

insert into properties (name, value, country, createdon) values ('line.DA', 1, 'ARG', now());
insert into properties (name, value, country, createdon) values ('line.RA', 1.1, 'ARG', now());
insert into properties (name, value, country, createdon) values ('line.NY', 1.1, 'ARG', now());

insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 0, 39, 1, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 40, 79, 1.4, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 80, 119, 1.6, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 120, 159, 1.8, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 160, 199, 2, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 200, 239, 2.2, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 240, 319, 2.4, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 320, 399, 2.6, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 400, 479, 2.8, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 480, 579, 3, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 580, 679, 3.2, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 680, 779, 3.4, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 780, 979, 3.4, 'ARG', now());
insert into properties (name, properties.from, properties.to, value, country, createdon) values ('area.designhours', 980, null, 3.4, 'ARG', now());
