
ALTER TABLE usuarios add column notifyPrevisions varchar(512);


create table usersmetadata (
  id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  userid varchar(64),
  type varchar(64),
  value varchar(2058)
)ENGINE=MyISAM;
