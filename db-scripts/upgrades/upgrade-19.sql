-- TO RUN IN ARG DB BEFORE IMPORT BRA

ALTER TABLE boats modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;

ALTER TABLE formulas modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;
ALTER TABLE groups modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;
ALTER TABLE providers modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;
ALTER TABLE sailgroups modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;
ALTER TABLE usuarios modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;

ALTER TABLE onedesign add column boatId int;


ALTER TABLE boats ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE cloths ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE dispatchs ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE dolar ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE formulas ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE groups ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE manualplotters ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE onedesign ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE orders ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE pctnac ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE plotters ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE previsions ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE previsionfulllogs ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE properties ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE providers ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE removedplotters ADD COLUMN country varchar(8) DEFAULT 'ARG' AFTER cuttedTimestamp;
ALTER TABLE sailgroups ADD COLUMN country varchar(8) DEFAULT 'ARG';
ALTER TABLE usuarios ADD COLUMN country varchar(8) DEFAULT 'ARG';

ALTER TABLE sails ADD COLUMN country varchar(8) DEFAULT 'ARG';


UPDATE products set providerId = 'adf4ce4a-2ef0-4c72-96f3-c845927defc5' where providerId = '5';

DELETE from providers where id = '5';

-- UPDATE providers set country = 'ALL' where id in ('1','2','3','4');

INSERT INTO properties values ('seasonWeeks.1', '4', now(), 'BRA');
INSERT INTO properties values ('seasonWeeks.2', '6', now(), 'BRA');
