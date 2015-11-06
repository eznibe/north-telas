-- version 3

alter table plotters modify column previsionId char(64);

alter table plotters add column noPrevisionId char(64);