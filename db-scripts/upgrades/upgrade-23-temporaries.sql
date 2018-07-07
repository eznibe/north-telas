
-- order product type can be set individually
alter table orderproduct add column temporary boolean DEFAULT false;


CREATE TABLE temporariesdispatch
(
   id varchar(64) PRIMARY KEY NOT NULL,
   description varchar(32),
   shortName varchar(16),
   dueDate date,
   realDueDate date,
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;

CREATE TABLE temporariesfile
(
   id varchar(64) PRIMARY KEY NOT NULL,
   dispatchId varchar(64),
   productId varchar(64),
   mtsInitial decimal(8,2),
   cif decimal(8,2),
   arancelary varchar(64), -- remove from here and add to the cloth
   type varchar(32), -- cloth type (group name)
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;

CREATE TABLE temporariesdownload
(
   id varchar(64) PRIMARY KEY NOT NULL,
   fileId varchar(64),
   description varchar(128),
   mts decimal(8,2),
   downloadDate date,
   country varchar(64),
   orderNumber varchar(64),
   downloadedBy varchar(64),
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;



create or replace view v_temporaries_files_extended as
SELECT f.*, coalesce(sum(dw.mts),0) as used, ((f.mtsInitial * 0.95) - coalesce(sum(dw.mts),0)) * 1.05 as available, ((f.mtsInitial * 0.95) - coalesce(sum(dw.mts),0)) as availableWithLoss 
FROM temporariesfile f left join temporariesdownload dw on dw.fileId = f.id
GROUP by f.id;
	

create or replace view v_temporaries_dispatch_extended as
SELECT d.*, sum(f.mtsInitial) as init, coalesce(sum(f.used),0) as used, sum(f.available) as available 
FROM temporariesdispatch d left join v_temporaries_files_extended f on d.id = f.dispatchId
GROUP by d.id;


create or replace view v_cloths_with_temporary_stock as
SELECT c.*, coalesce(sum(f.available), 0) as temporaryAvailable, coalesce(sum(f.availableWithLoss), 0) as temporaryAvailableWithLoss
FROM cloths c 
join products p on p.clothId=c.id 
left join v_temporaries_files_extended f on f.productId=p.productId 
GROUP by c.id, c.name;


alter table temporariesfile add column type_2 varchar(32);

update temporariesfile set type_2=type, type = null;

alter table temporariesfile add column rollWidth decimal(8,2);