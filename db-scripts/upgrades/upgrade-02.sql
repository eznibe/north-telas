drop table if exists removedPlotters;

CREATE TABLE removedPlotters
(
   id char(64) NOT NULL,
   previsionId char(64),
   clothId char(64) NOT NULL,
   mtsDesign decimal(5,2), 
   plotterDate date,
   manualPlotterId varchar(64), -- fk manualPlotter.id
   observations varchar(128),
   cutted boolean,
   createdOn timestamp
)ENGINE=MyISAM
;