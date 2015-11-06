drop table if exists dolar;

CREATE TABLE dolar
(
   value decimal(5,2),
   createdOn timestamp
)ENGINE=MyISAM
;


insert into dolar (value) values (8.8);