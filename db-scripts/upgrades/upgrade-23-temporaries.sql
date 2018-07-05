
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
SELECT f.*, coalesce(sum(dw.mts),0) as used, (f.mtsInitial * 0.95) - coalesce(sum(dw.mts),0) as available 
FROM temporariesfile f left join temporariesdownload dw on dw.fileId = f.id
GROUP by f.id;
	

create or replace view v_temporaries_dispatch_extended as
SELECT d.*, sum(f.mtsInitial * 0.95) as init, coalesce(sum(f.used),0) as used, sum(f.mtsInitial * 0.95) - coalesce(sum(f.used),0) as available 
FROM temporariesdispatch d left join v_temporaries_files_extended f on d.id = f.dispatchId
GROUP by d.id;