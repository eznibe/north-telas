-- TO RUN IN BRASIL DB BEFORE EXPORT THE DATA

-- to update to canvas id in arg db
UPDATE cloths set groupId = 8 where groupId = 6;

alter table orders add column modifiedOn timestamp ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE sails add column sailGroupId varchar(64);
ALTER TABLE sails add column formulaId varchar(64);

alter table sails modify column id int;

ALTER TABLE onedesign add column boatId int;

update orders set number = 190 where number = 1;
update orders set number = 191 where number = 18;
update orders set number = number + 100;


alter table previsions add column seller varchar(32);
alter table previsions add column dispatchId varchar(64);
alter table previsions add column line varchar(16);
alter table previsions add column week int;
alter table previsions add column priority int;
alter table previsions add column percentage int;
alter table previsions add column advance int;
alter table previsions add column tentativeDate date;
alter table previsions add column productionDate date;
alter table previsions add column infoDate date;
alter table previsions add column advanceDate date;
alter table previsions add column deletedProductionOn date;
alter table previsions add column deletedProductionBy varchar(32);
alter table previsions add column productionObservations varchar(1024);
alter table previsions add column designObservations varchar(1024);
alter table previsions add column driveIdProduction varchar(128);
alter table previsions add column driveIdDesign varchar(128);
alter table previsions add column sailGroupId int;
alter table previsions add column rizo int;

alter table previsions modify column sailId int;

ALTER TABLE cloths ADD COLUMN matchClothId varchar(64) AFTER groupId;

ALTER TABLE boats ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE cloths ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE dolar ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE formulas ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE groups ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE manualplotters ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE onedesign ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE orders ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE pctnac ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE plotters ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE previsions ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE providers ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE removedplotters ADD COLUMN country varchar(8) DEFAULT 'BRA';
ALTER TABLE usuarios ADD COLUMN country varchar(8) DEFAULT 'BRA';
