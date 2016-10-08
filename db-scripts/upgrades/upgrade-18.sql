-- new formulas for sails

ALTER TABLE formulas add column value2 decimal(5,2);

ALTER TABLE sails add column formulaId varchar(64);

ALTER TABLE formulas drop COLUMN split;

ALTER TABLE formulas add COLUMN rizo char(1) default 'N';

update sails set description = 'Asimetrico crosscut' where id = 81;

delete from sailgroups where id = 8;

INSERT INTO sailgroups (id,name) VALUES (8,'Cubremayor');
INSERT INTO sailgroups (id,name) VALUES (9,'Otra');

update sails set sailGroupId=9 where sailGroupId=8;

update sails set sailGroupId=3 where id=13;

alter table previsions add column rizo int;
alter table previsionfulllogs add column rizo int;



--mayor y mesana
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('30','Mayor y Mesana c rizo', 1.10, 1.20,'SUP','MULT','Y');
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('35','Mayor y Mesana', 1.10, 1.30,'SUP','MULT','N');
--genoa y foque
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('38','Genoa y Foque', 1.10, 1.30,'SUP','MULT','N');
--asimetrico
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('74','Asimetrico1', 1.20, null,'SUP','MULT','N');
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('75','Asimetrico2', 1.10, null,'SUP','MULT','N');
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('76','Asimetrico3', 1.15, null,'SUP','MULT','N');
--spinnaker
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('85','Spinnaker', 1.10, null,'SUP','MULT','N');
-- staysail
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('92','Staysail',1.10,1.30,'SUP','MULT','N');
--cubremayor
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('95','Garruchos>30',2,0.5,'E','MULT','N');
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('96','Lazzy>30',2,1,'E','MULT','N');
INSERT INTO formulas (id,formula,value,value2,fields,type,rizo) VALUES ('97','Cubremayor<30',2,0,'E','MULT','N');


update sails set formulaId = '30' where id >= 30 and id <= 34 ; --mayor1
update sails set formulaId = '35' where id >= 35 and id <= 37 ; --mayor2
update sails set formulaId = '30' where id >= 66 and id <= 70 ; --mesana1
update sails set formulaId = '35' where id >= 71 and id <= 73 ; --mesana2
update sails set formulaId = '38' where id >= 38 and id <= 47 ; --genoa
update sails set formulaId = '38' where id in (15,16) ; --genoa extra
update sails set formulaId = '38' where id >= 48 and id <= 65 ; --foque
update sails set formulaId = '38' where id in (13,14) ; --foque extra
update sails set formulaId = '74' where id in (74, 81)  ; --asim1
update sails set formulaId = '75' where id >= 75 and id <= 77 ; --asim2
update sails set formulaId = '75' where id >= 82 and id <= 84 ; --asim2
update sails set formulaId = '76' where id >= 78 and id <= 80 ; --asim3
update sails set formulaId = '85' where id >= 85 and id <= 91 ; --spinnake
update sails set formulaId = '92' where id >= 92 and id <= 94 ; --staysail

INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (100,'Garruchos < 30 pies',null, null,8,'97');
INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (101,'Lazzy < 30 pies',null, null,8,'97');
INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (102,'Garruchos > 30 pies',null, null,8,'95');
INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (103,'Lazzy > 30 pies',null, null,8,'96');

INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (110,'Trinquetilla de enrollar',null, null,3,'38');
INSERT INTO sails (id,description,formulaLower44Id,formulaGreater44Id,sailGroupId,formulaId) VALUES (111,'Trinquetilla de enrollar c/battens',null, null,3,'38');
