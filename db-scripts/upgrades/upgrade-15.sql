CREATE TABLE sailgroups
(
   id int PRIMARY KEY NOT NULL,
   name varchar(64)
)ENGINE=MyISAM
;

insert into sailgroups values (1, 'Mayor');
insert into sailgroups values (2, 'Genoa');
insert into sailgroups values (3, 'Foque');
insert into sailgroups values (4, 'Mesana');
insert into sailgroups values (5, 'Asimetrico');
insert into sailgroups values (6, 'Spinnaker');
insert into sailgroups values (7, 'Staysail');
insert into sailgroups values (8, 'Otra');

alter table sails add column sailGroupId int;

alter table sails modify column id int;

delete from sails where id = 18;

update sails set sailGroupId = 1 where id in (1,2);
update sails set sailGroupId = 2 where id in (3,4);
update sails set sailGroupId = 7 where id in (5);
update sails set sailGroupId = 6 where id in (6,7);
update sails set sailGroupId = 5 where id in (8);
update sails set sailGroupId = 2 where id in (9);
update sails set sailGroupId = 1 where id in (10);
update sails set sailGroupId = 4 where id in (11);
update sails set sailGroupId = 7 where id in (12);
update sails set sailGroupId = 1 where id in (13);
update sails set sailGroupId = 3 where id in (14);
update sails set sailGroupId = 2 where id in (15,16);
update sails set sailGroupId = 3 where id in (19,20);


insert into sails (id, description, sailGroupId) values (30, 'Estandar', 1);
insert into sails (id, description, sailGroupId) values (31, 'Fullbatten', 1);
insert into sails (id, description, sailGroupId) values (32, 'High Roach', 1);
insert into sails (id, description, sailGroupId) values (33, 'Square Head', 1);
insert into sails (id, description, sailGroupId) values (34, 'Enrollar en botavara', 1);
insert into sails (id, description, sailGroupId) values (35, 'Enrollar en Mastil', 1);
insert into sails (id, description, sailGroupId) values (36, 'Enrollar en mastil c/battens', 1);
insert into sails (id, description, sailGroupId) values (37, 'De capa', 1);
insert into sails (id, description, sailGroupId) values (38, 'Light', 2);
insert into sails (id, description, sailGroupId) values (39, 'Light Medium', 2);
insert into sails (id, description, sailGroupId) values (40, 'Medium', 2);
insert into sails (id, description, sailGroupId) values (41, 'Medium Heavy', 2);
insert into sails (id, description, sailGroupId) values (42, 'Heavy', 2);
insert into sails (id, description, sailGroupId) values (43, 'Genoa 2', 2);
--insert into sails (id, description, sailGroupId) values (44, 'Jib Top', 2);
insert into sails (id, description, sailGroupId) values (45, 'Genoa de Enrollar', 2);
--insert into sails (id, description, sailGroupId) values (46, 'Yankee', 2);
insert into sails (id, description, sailGroupId) values (47, 'Yankee de enrollar', 2);
insert into sails (id, description, sailGroupId) values (48, 'Light', 3);
insert into sails (id, description, sailGroupId) values (49, 'Light Medium', 3);
insert into sails (id, description, sailGroupId) values (50, 'Medium', 3);
insert into sails (id, description, sailGroupId) values (51, 'Medium Heavy', 3);
insert into sails (id, description, sailGroupId) values (52, 'Heavy', 3);
insert into sails (id, description, sailGroupId) values (53, '#3', 3);
insert into sails (id, description, sailGroupId) values (54, '#4', 3);
insert into sails (id, description, sailGroupId) values (55, '#4 HWJ', 3);
insert into sails (id, description, sailGroupId) values (56, '#5', 3);
--insert into sails (id, description, sailGroupId) values (57, 'Tormentin', 3);
insert into sails (id, description, sailGroupId) values (58, 'Foque de enrollar', 3);
insert into sails (id, description, sailGroupId) values (59, 'Foque de enrollar c/battens', 3);
insert into sails (id, description, sailGroupId) values (60, 'Foque selftacking', 3);
insert into sails (id, description, sailGroupId) values (61, 'Foque selftacking de enrollar', 3);
insert into sails (id, description, sailGroupId) values (62, 'Foque selftacking de enrollar c/battens', 3);
insert into sails (id, description, sailGroupId) values (63, 'Genoa Staysail', 3);
insert into sails (id, description, sailGroupId) values (64, 'Genoa Staysail de enrollar', 3);
insert into sails (id, description, sailGroupId) values (65, 'Genoa Staysail de enrollar c/battens', 3);
insert into sails (id, description, sailGroupId) values (66, 'Estandar', 4);
insert into sails (id, description, sailGroupId) values (67, 'Fullbatten', 4);
insert into sails (id, description, sailGroupId) values (68, 'High Roach', 4);
insert into sails (id, description, sailGroupId) values (69, 'Square Head', 4);
insert into sails (id, description, sailGroupId) values (70, 'Enrollar en botavara', 4);
insert into sails (id, description, sailGroupId) values (71, 'Enrollar en Mastil', 4);
insert into sails (id, description, sailGroupId) values (72, 'Enrollar en mastil c/battens', 4);
insert into sails (id, description, sailGroupId) values (73, 'De capa', 4);
insert into sails (id, description, sailGroupId) values (74, 'A0', 5);
insert into sails (id, description, sailGroupId) values (75, 'A1', 5);
insert into sails (id, description, sailGroupId) values (76, 'A1.5', 5);
insert into sails (id, description, sailGroupId) values (77, 'A2', 5);
insert into sails (id, description, sailGroupId) values (78, 'A3', 5);
insert into sails (id, description, sailGroupId) values (79, 'A4', 5);
insert into sails (id, description, sailGroupId) values (80, 'A5', 5);
insert into sails (id, description, sailGroupId) values (81, 'Code F', 5);
insert into sails (id, description, sailGroupId) values (82, 'G0', 5);
insert into sails (id, description, sailGroupId) values (83, 'G1', 5);
insert into sails (id, description, sailGroupId) values (84, 'G2', 5);
insert into sails (id, description, sailGroupId) values (85, 'S0', 6);
insert into sails (id, description, sailGroupId) values (86, 'S1', 6);
insert into sails (id, description, sailGroupId) values (87, 'S1.5', 6);
insert into sails (id, description, sailGroupId) values (88, 'S2', 6);
insert into sails (id, description, sailGroupId) values (89, 'S3', 6);
insert into sails (id, description, sailGroupId) values (90, 'S4', 6);
insert into sails (id, description, sailGroupId) values (91, 'S5', 6);
insert into sails (id, description, sailGroupId) values (92, 'Windseeker', 7);
insert into sails (id, description, sailGroupId) values (93, 'Spinnaker staysail', 7);
insert into sails (id, description, sailGroupId) values (94, 'Staysail de Mesana', 7);


alter table previsions add column sailGroupId int;
alter table previsionfulllogs add column sailGroupId int;

update previsions, sails set previsions.sailGroupId = sails.sailGroupId where sails.id = previsions.sailId;

update previsions set sailGroupId = 8 where sailid = 18;

alter table previsions modify column sailId int;

alter table previsionfulllogs modify column sailId int;
