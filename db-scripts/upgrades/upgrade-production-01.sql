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

update previsions set week = 19 where week is null;


CREATE TABLE dispatchs
(
   id char(64) PRIMARY KEY NOT NULL,
   number int,
   dispatchDate date,
   destinatary varchar(128),
   destiny varchar(128),
   transport varchar(128),
   deliveryType varchar(64),
   archived boolean default false,
   archivedOn timestamp ON UPDATE CURRENT_TIMESTAMP
)ENGINE=MyISAM
;

CREATE TABLE dispatchPrevisions
(
   id char(64) PRIMARY KEY NOT NULL,
   dispatchId varchar(64),
   previsionId varchar(64),
   carryId varchar(64),
   weight int,
   observations varchar(1024)
)ENGINE=MyISAM
;


CREATE TABLE dispatchCarries
(
   id char(64) PRIMARY KEY NOT NULL,
   dispatchId varchar(64),
   number int,
   measures varchar(128),
   weight int,
   type varchar(32) -- BOX / TUBE
)ENGINE=MyISAM
;


alter table previsions add column deletedProductionOn date;
alter table previsions add column deletedProductionBy varchar(32);
alter table previsions add column productionObservations varchar(1024);
alter table previsions add column designObservations varchar(1024);

delete from plotters where clothId is null or clothId = '';
delete previsions from previsions left join plotters on plotters.previsionId = previsions.id where previsions.designed = true and plotters.id is null

update previsions p join plotters pl on p.id = pl.previsionId set p.deletedProductionOn = '2016-06-01', p.deletedProductionBy = 'script' where pl.cuttedOn < '2016-05-01'

update previsions set percentage = 6 where designed = true and percentage is null;

--

alter table dispatchs add column address varchar(64);
alter table dispatchs add column value float;
alter table dispatchs add column tracking varchar(64);
alter table dispatchs add column notes varchar(1024);

alter table dispatchs modify column number int;

alter table dispatchPrevisions add column orderNumber varchar(64);
alter table dispatchPrevisions add column client varchar(64);
