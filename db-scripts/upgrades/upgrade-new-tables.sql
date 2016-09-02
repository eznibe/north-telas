create table logrolls ENGINE=MyISAM as
select * from rolls limit 1;

delete from logrolls;

alter table logrolls add column method varchar(128);
alter table logrolls add column insertedOn timestamp ON UPDATE CURRENT_TIMESTAMP;

--
