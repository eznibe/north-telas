CREATE TABLE fileslogs
(
   id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
   action varchar(64),
   folder varchar(16),
   fileId varchar(32),
   fileName varchar(64),
   parentId varchar(32),
   previsionId varchar(64),
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
   user varchar(64)
)ENGINE=MyISAM
;
