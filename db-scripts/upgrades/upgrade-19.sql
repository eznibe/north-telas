-- TO RUN IN ARG DB BEFORE IMPORT BRA

ALTER TABLE boats modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;

ALTER TABLE formulas modify column id int PRIMARY KEY NOT NULL AUTO_INCREMENT;
--ALTER TABLE groups modify column id int NOT NULL AUTO_INCREMENT;

ALTER TABLE sailgroups modify column id int NOT NULL AUTO_INCREMENT;

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

ALTER TABLE cloths ADD COLUMN matchClothId varchar(64) AFTER groupId;

UPDATE products set providerId = 'adf4ce4a-2ef0-4c72-96f3-c845927defc5' where providerId = '5';

DELETE from providers where id = '5';

-- UPDATE providers set country = 'ALL' where id in ('1','2','3','4');

INSERT INTO properties values ('seasonWeeks.1', '4', now(), 'BRA');
INSERT INTO properties values ('seasonWeeks.2', '6', now(), 'BRA');


CREATE TABLE removeddispatchs
(
   id char(64) PRIMARY KEY NOT NULL,
   number int,
   dispatchDate date,
   destinatary varchar(128),
   destiny varchar(128),
   transport varchar(128),
   deliveryType varchar(64),
   archived bit DEFAULT 0,
   archivedOn timestamp DEFAULT '0000-00-00 00:00:00' NOT NULL,
   address varchar(64),
   value real,
   tracking varchar(64),
   notes text,
   country varchar(8) ,
   insertedon timestamp default CURRENT_TIMESTAMP
)ENGINE=MyISAM
;

create table extra_cloths_matching
(
  argid varchar(64),
  braid varchar(64)
)ENGINE=MyISAM;

insert into extra_cloths_matching values ('41', '58162e2734a8c'); -- airx
--insert into extra_cloths_matching values ('', '34525cfd-fc43-4d8b-c744-1c5a45f8df86'); -- 650 black
insert into extra_cloths_matching values ('149', 'b411f7f9-e084-4d0b-9385-f1d0d7ff6bbe');
--insert into extra_cloths_matching values ('', '677ef851-1611-42fc-df82-861f7a31de8b'); -- 650 green
insert into extra_cloths_matching values ('150', '1945b112-e95a-4c07-beda-600e674bff43');
insert into extra_cloths_matching values ('42', '58162e2735370');
--insert into extra_cloths_matching values ('', '59fb3e51-cc68-41f7-a174-da066bf03bad'); -- 650 yellow
insert into extra_cloths_matching values ('43', '58162e2736ffe');
insert into extra_cloths_matching values ('28', '58162e272ecbd'); --bx05
insert into extra_cloths_matching values ('e726a1ac-c305-4c66-ccb5-19f3b83007ea', 'b44d8fda-fb39-4650-a6b3-23ed557212a3'); -- dilon
insert into extra_cloths_matching values ('4748c8ea-7c56-4f2b-c888-5679ad7579ae', '2d8bc1e6-f7bf-456d-f22e-c95912e6d5b3');
insert into extra_cloths_matching values ('4d93e39e-694d-41ca-83a1-606355a194d4', 'ad741e57-7a99-4404-cfbc-5ddcd5f2616b');
insert into extra_cloths_matching values ('febf7744-ddfd-482b-e605-174b949cd2c6', 'ca203945-02c1-414a-927b-be698fdd14d2');
insert into extra_cloths_matching values ('7b313dd5-8b5b-414b-8743-e7f3303d65a0', 'fbaa403f-5725-4c6b-8779-d8286e1ca7bb');
insert into extra_cloths_matching values ('c6638d4f-9045-40af-dd70-98785246db77', '8adc4f72-2a94-4fd9-c98f-a9b4fefba1eb');
insert into extra_cloths_matching values ('526c5254-eb3e-4554-9179-0b39c7c56e13', 'dd6c91ad-d809-4769-8269-ff1e70bdc1e7');
--insert into extra_cloths_matching values ('', 'b73ec77e-40bc-4466-bfda-4a7523cc72fe'); -- 150 red
insert into extra_cloths_matching values ('8b0d9de8-4dff-4bcf-a2e2-b939cb3c89c8', '2fcd3874-690d-464a-d358-90bc0432fb03');
insert into extra_cloths_matching values ('46', '58162e27381a4'); -- Mp
insert into extra_cloths_matching values ('50', '58162e273a23a');
insert into extra_cloths_matching values ('49', '58162e2739437');
insert into extra_cloths_matching values ('47', '58162e2738af3');
insert into extra_cloths_matching values ('45', '58162e27378b2');
insert into extra_cloths_matching values ('52', '58162e273b3cb');
insert into extra_cloths_matching values ('55', '58162e273d6f1');
insert into extra_cloths_matching values ('54', '58162e273ccf2');
insert into extra_cloths_matching values ('53', '58162e273c14c');
insert into extra_cloths_matching values ('51', '58162e273ab05');
--insert into extra_cloths_matching values ('', '6e5945ad-c208-441d-a87f-1f4d12d039b1'); --ultraxc 320
insert into extra_cloths_matching values ('f86759c8-f8b0-461f-d774-482db6a4086f', '7051f1c2-36bb-4086-d34b-b895710a97fe'); -- yacht
insert into extra_cloths_matching values ('ba87b3ba-75d7-4150-a127-1f337b0b28b7', 'efda64ca-a446-4cf6-e1e3-d7efc43af1bd');
--insert into extra_cloths_matching values ('', '0b0c9bd7-f481-4ea3-a2df-137dad08d92a');  -- marfil
--insert into extra_cloths_matching values ('', 'ad825e20-6a7c-4445-ddb6-524716646e4b'); -- natural
insert into extra_cloths_matching values ('41a99456-73ec-4099-9c60-ff406647b22a', 'e6a8f6ec-ec7e-43bc-a343-c2499ee1ffcf');
--insert into extra_cloths_matching values ('', 'ad083d1a-a19c-4b60-9123-0e646504b41f'); -- real azul
--insert into extra_cloths_matching values ('', 'ed829f72-54b4-4905-aceb-9be69524adca'); -- vermelho
--insert into extra_cloths_matching values ('', '44ef215b-f9c4-41a1-dc1e-ed568602aa73'); -- nordac 7.7
--insert into extra_cloths_matching values ('', '7f9d6e9c-4b9f-4a4e-f47b-d9a37ff45d77'); -- norlon 250 white
insert into extra_cloths_matching values ('56', '58162e273e3a3'); -- nylite 60 white
insert into extra_cloths_matching values ('167', '58162e273f8d7'); -- nylite 90 blanco
insert into extra_cloths_matching values ('73', '58162e27252d6');  --shelf 4.0
--insert into extra_cloths_matching values ('', '58162e2729fd6'); -- 280 ap mto
--insert into extra_cloths_matching values ('', '58162e272a9c4'); -- 410 ap mto
--insert into extra_cloths_matching values ('', '58162e272b5fc'); -- 450 ap mto
