
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
