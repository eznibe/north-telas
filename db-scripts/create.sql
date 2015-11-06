drop database telas;

create database telas;

use telas;


drop table if exists usuarios;

CREATE TABLE usuarios
(
   id char(64) PRIMARY KEY NOT NULL,
   username char(50) NOT NULL,
   password char(50),
   name char(100),
   role char(32) NOT NULL DEFAULT 'admin'
)ENGINE=MyISAM
;

insert into usuarios (id, username, password, name, role) values ('1', 'admin', 'admin', 'Admin', 'admin');
insert into usuarios (id, username, password, name, role) values ('2', 'user', 'user', 'User', 'admin');
insert into usuarios (id, username, password, name, role) values ('3', 'ezequiel', 'ezequiel', 'Ezequiel', 'design');
insert into usuarios (id, username, password, name, role) values ('4', 'ploteador', 'ploteador', 'Ploteador', 'plotter');


drop table if exists roles;

CREATE TABLE roles
(
   id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
   role char(32) NOT NULL
)ENGINE=MyISAM
;

insert into roles (role) values ('admin');
insert into roles (role) values ('design');
insert into roles (role) values ('plotter');



drop table if exists groups;

CREATE TABLE groups
(
   id char(64) PRIMARY KEY NOT NULL,
   name char(50) NOT NULL
)ENGINE=MyISAM
;

insert into groups values ('1', 'Dacron');
insert into groups values ('2', 'Laminado');
insert into groups values ('3', 'Nylon');
insert into groups values ('4', 'Especiales');
insert into groups values ('5', 'Discontinuados');


CREATE TABLE cloths
(
   id char(64) PRIMARY KEY NOT NULL,
   name char(50) NOT NULL,
   stockMin int,
   groupId char(64)
)ENGINE=MyISAM
;

insert into cloths values ('1', 'Radian 5.2', 100, '1');
insert into cloths values ('2', 'Radian 6.0', 15, '1');
insert into cloths values ('3', 'Radian 7.5', 80, '1');
insert into cloths values ('4', 'Radian 7.8', 10, '1');
insert into cloths values ('5', 'Radian 8.1', 10, '1');
insert into cloths values ('6', 'Radian 8.5', 10, '1');
insert into cloths values ('7', 'Kev 1.0', 10, '2');
insert into cloths values ('8', 'Kev 3.2', 10, '2');
insert into cloths values ('9',  'Ny1.0', 0, '3');
insert into cloths values ('10', 'Ny1.3', 2, '3');
insert into cloths values ('11', 'Ny2.0', 10, '3');


drop table if exists djais;

CREATE TABLE djais
(
   id char(64) PRIMARY KEY NOT NULL,
   number char(50) NOT NULL,
   djaiDate date,
   amount decimal(5,2),
   clothId char(64)
)ENGINE=MyISAM
;

insert into djais values ('1', 'DJ1.0', '2014-02-10', 15, '1');
insert into djais values ('2', 'DJ2.1', '2014-05-09', 30, '1');


drop table if exists previsions;

CREATE TABLE previsions
(
   id char(64) PRIMARY KEY NOT NULL,
   orderNumber varchar(50) NOT NULL,
   deliveryDate date,
   client varchar(64),
   sailId  varchar(64),
   sailDescription  varchar(64),
   boat  varchar(64),
   type  varchar(16),
   designed boolean default false,
   oneDesign boolean default false,
   greaterThan44 boolean default false,
   p decimal(5,2),
   e decimal(5,2),
   i decimal(5,2),
   j decimal(5,2),
   area decimal(5,2)
)ENGINE=MyISAM
;

insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('1', 'V3186-1', '2014-08-01', 'Sr X', '1', 'X', 'TEMP', false);
insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('2', 'V9170-1', '2014-07-21', 'Mr Y', '2', 'B1', 'TEMP', false);
insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('3', 'V3132-1', '2014-05-13', 'Me', '3', 'B2', 'DEF', false);
insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('4', 'V3120-1', '2014-03-01', 'One', '4', 'My', 'DEF', false);
insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('5', 'V3054-1', '2013-12-13', 'Mr T', '5', 'Bo', 'TEMP', false);
insert into previsions (id, orderNumber, deliveryDate, client, sailId, boat, type, designed) values ('10', 'V3422-1', '2014-09-03', 'Mr T', '6', 'Bo', 'TEMP', true);


CREATE TABLE previsionCloth
(
   cpId char(64) PRIMARY KEY NOT NULL,
   previsionId char(64) NOT NULL,
   clothId char(64) NOT NULL,
   mts decimal(5,2)
)ENGINE=MyISAM
;

insert into previsioncloth values ('1', '1', '1', 10);
insert into previsioncloth values ('2', '1', '2', 17);
insert into previsioncloth values ('3', '2', '1', 30);
insert into previsioncloth values ('4', '2', '2', 32);
insert into previsioncloth values ('5', '2', '3', 12);
insert into previsioncloth values ('6', '3', '9', 40);
insert into previsioncloth values ('7', '4', '12', 30);
insert into previsioncloth values ('8', '4', '13', 21);
insert into previsioncloth values ('9', '5', '1', 15);
insert into previsioncloth values ('10', '10', '1', 30);
insert into previsioncloth values ('11', '10', '2', 10);


CREATE TABLE providers
(
   id char(64) PRIMARY KEY NOT NULL,
   name varchar(50) NOT NULL,
   countryId int
)ENGINE=MyISAM
;

insert into providers values ('1', 'North Cloth', 1);
insert into providers values ('2', 'Siris', 1);
insert into providers values ('3', 'NC Europe', 2);
insert into providers values ('4', 'Batal', 1);


drop table if exists products;

CREATE TABLE products
(
   productId char(64) PRIMARY KEY NOT NULL,
   providerId char(64) NOT NULL,
   clothId char(64) NOT NULL,
   code char(16),
   price decimal(5,2)
)ENGINE=MyISAM
;

insert into products values ('1', '1', '1', 'NRAD50', 100);
insert into products values ('2', '2', '1', 'NRAD45', 75);
insert into products values ('3', '3', '2', 'ACT10', 75);
insert into products values ('4', '1', '3', 'TEC20', 75);
insert into products values ('5', '3', '3', 'EUR45', 98);
insert into products values ('6', '4', '3', 'ART32', 123);
insert into products values ('7', '1', '9', 'OILA45', 75);
insert into products values ('8', '2', '9', 'OILB45', 80);
insert into products values ('9', '3', '10', 'ANAD45', 10);
insert into products values ('10', '4', '11', 'FRAD45', 5);



drop table if exists orders;

CREATE TABLE orders
(
   orderId char(64) PRIMARY KEY NOT NULL,
   orderDate date,
   arriveDate date,
   invoiceNumber char(32),
   status char(32) NOT NULL default 'TO_BUY',
   type char(32),
   providerId char(32) NOT NULL,
   description varchar(128),
   deliveryType char(32) default 'Desconocido'
)ENGINE=MyISAM
;

insert into orders values ('1', null, null, null, 'TO_BUY', null, '1', null, 'Nacional');
insert into orders values ('2', null, null, null, 'TO_BUY', null, '3', null, 'Nacional');
insert into orders values ('3', '2014-08-01', null, null, 'TO_CONFIRM', 'TEMP', '1', null, 'Maritimo');
insert into orders values ('4', '2014-07-10', '2014-12-05', 'C-0001-FC', 'ARRIVED', null, '4', null, 'Aereo1');
insert into orders values ('5', '2014-08-14', null, null, 'IN_TRANSIT', 'DEF', '3', null, 'Aereo2');
insert into orders values ('8', '2014-08-10', '2014-12-10', 'C-0002-FC', 'ARRIVED', null, '4', null, 'Aereo1');


CREATE TABLE orderProduct
(
   opId char(64) PRIMARY KEY NOT NULL,
   orderId char(64) NOT NULL,
   productId char(64) NOT NULL,
   amount decimal(5,2),
   price decimal(5,2)
)ENGINE=MyISAM
;

insert into orderproduct values ('1', '1', '1', 3, 5);
insert into orderproduct values ('2', '1', '4', 4, 3.5);
insert into orderproduct values ('3', '2', '22', 3.5, 4);
insert into orderproduct values ('4', '3', '1', 10, 2);
insert into orderproduct values ('5', '3', '4', 50, 1);
insert into orderproduct values ('6', '3', '7', 20.5, 4);
insert into orderproduct values ('7', '4', '6', 12, 3);
insert into orderproduct values ('8', '4', '10', 5, 2);
insert into orderproduct values ('9', '5', '3', 4.8, 10);
insert into orderproduct values ('10', '5', '5', 2, 5);
insert into orderproduct values ('11', '5', '9', 5, 5);
insert into orderproduct values ('12', '8', '6', 5, 2);
insert into orderproduct values ('13', '8', '7', 10, 2);


drop table if exists rolls;

CREATE TABLE rolls
(
   id char(64) PRIMARY KEY NOT NULL,
   productId char(64) NOT NULL,
   type char(16),
   number char(16) NOT NULL,
   lote char(16) NOT NULL,
   mtsOriginal decimal(5,2),
   mts decimal(5,2),
   orderId char(64) NOT NULL,
   incoming boolean
)ENGINE=MyISAM
;

insert into rolls values ('1', '1', 'DEF' , 'N12' , '10' , 20, 20, '6', false);
insert into rolls values ('2', '1', 'DEF' , 'N13' , '11' , 10, 10, '6', false);
insert into rolls values ('3', '2', 'DEF' , 'R50' , '60' , 20, 20, '6', false);
insert into rolls values ('4', '3', 'DEF' , 'N12' , '11' , 25, 25, '7', false);
insert into rolls values ('5', '1', 'DEF' , 'R4' , '1E' , 12, 0, '4', false);
insert into rolls values ('6', '1', 'DEF' , 'R4' , '1F' , 4, 1, '4', false);
insert into rolls values ('7', '6', 'DEF' , 'R5' , '1K' , 5, 5, '8', false);



drop table if exists manualStock;

CREATE TABLE manualStock
(
   id char(64) PRIMARY KEY NOT NULL,
   productId char(64) NOT NULL,
   type char(16),
   mts decimal(5,2),
   rollId char(64),
   moveDate date
)ENGINE=MyISAM
;

insert into manualStock values ('1', '1', 'DEF' , 30, null, CURRENT_DATE);
insert into manualStock values ('2', '2', 'DEF' , 20, null, CURRENT_DATE);
insert into manualStock values ('3', '3', 'DEF' , 25, null, CURRENT_DATE);
insert into manualStock values ('4', '4', 'DEF' , 20, null, CURRENT_DATE);
insert into manualStock values ('5', '5', 'DEF' , 40, null, CURRENT_DATE);
insert into manualStock values ('6', '6', 'DEF' , 10, null, CURRENT_DATE);
insert into manualStock values ('7', '7', 'DEF' , 10, null, CURRENT_DATE);
insert into manualStock values ('9', '9', 'DEF' , 5, null, CURRENT_DATE);
insert into manualStock values ('10', '10', 'DEF' , 3, null, CURRENT_DATE);


drop table if exists plotters;

CREATE TABLE plotters
(
   id char(64) NOT NULL,
   previsionId char(64),
   clothId char(64) NOT NULL,
   mtsDesign decimal(5,2), 
   plotterDate date,
   manualPlotterId varchar(64), -- fk manualPlotter.id
   observations varchar(128),
   cutted boolean
)ENGINE=MyISAM
;

insert into plotters values ('1', '10', '1', 30, '2014-09-05', null, null, false);
insert into plotters values ('2', '10', '2', 10, '2014-09-05', null, null, false);
insert into plotters values ('3', '10', '1', 20, '2014-09-08', null, null, true);


drop table if exists plotterCuts;

CREATE TABLE plotterCuts
(
   id char(64) PRIMARY KEY NOT NULL,
   plotterId char(64) NOT NULL,
   mtsCutted decimal(5,2), 
   rollId char(64)    
)ENGINE=MyISAM
;

insert into plotterCuts values ('1', '1', 15, '1');
insert into plotterCuts values ('2', '3', 12, '5');
insert into plotterCuts values ('3', '3', 3, '6');



drop table if exists manualPlotters;

CREATE TABLE manualPlotters
(
   id char(64) NOT NULL,
   sOrder char(64),
   orderNumber char(64)
)ENGINE=MyISAM
;


drop table if exists sails;

CREATE TABLE sails
(
   id char(64) NOT NULL,
   description char(64),
   formulaLower44Id varchar(64),
   formulaGreater44Id varchar(64)
)ENGINE=MyISAM
;

drop table if exists formulas;

CREATE TABLE formulas
(
   id char(64) NOT NULL,
   formula char(64),   
   value decimal(5,2),
   fields varchar(8),
   type varchar(32),
   split char(1)
)ENGINE=MyISAM
;


drop table if exists boats;

CREATE TABLE boats
(
   id char(64) NOT NULL,
   boat char(64)
)ENGINE=MyISAM
;

drop table if exists onedesign;

CREATE TABLE onedesign
(
   id char(64) NOT NULL,
   boat char(64),  
   sailPrefix char(32), 
   clothId char(64),   
   mts decimal(5,2)
)ENGINE=MyISAM
;
