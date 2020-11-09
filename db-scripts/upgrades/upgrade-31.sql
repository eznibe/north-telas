-- one design module changes

drop view v_onedesign_grouped;

create view v_onedesign_grouped as
SELECT boat, sailPrefix FROM onedesign group by boat, sailPrefix;

drop view v_onedesign_previsions_grouped;

create view v_onedesign_previsions_grouped as
SELECT p.boat, p.sailOneDesign, substring_index(group_concat(distinct p.sailDescription order by p.deliveryDate desc, p.sailDescription desc), ',', 1) as model, p.country
FROM previsions p join v_onedesign_grouped d on p.boat = d.boat and p.sailOneDesign = d.sailPrefix
group by p.boat, p.sailOneDesign, p.country;


drop view v_onedesign_previsions_newest_grouped

create view v_onedesign_previsions_newest_grouped as
SELECT boat, sailOneDesign, country, max(createdOn) createdOn FROM previsions where oneDesign = true group by boat, sailOneDesign, country;


drop view v_onedesign_max_sequence

create view v_onedesign_max_sequence as
SELECT p.boat, p.sailOneDesign, p.country, case when SUBSTRING_INDEX(sailDescription, '-', -1) REGEXP '^[0-9]+$' = 1 then SUBSTRING_INDEX(sailDescription, '-', -1) else null end as maxSequence
FROM v_onedesign_previsions_newest_grouped as prevMaxCreation
JOIN previsions p on p.createdOn = prevMaxCreation.createdOn and p.boat = prevMaxCreation.boat and p.sailOneDesign = prevMaxCreation.sailOneDesign and p.country = prevMaxCreation.country 
where p.oneDesign = true
group by p.boat, p.sailOneDesign, p.country;


drop view v_onedesign_max_sequence_by_model

create view v_onedesign_max_sequence_by_model as
SELECT d.boat, d.sailPrefix as sail, previsionsOD.model, previsionsODMaxSequence.maxSequence, coalesce(previsionsOD.country, 'ARG') as country
FROM v_onedesign_grouped d 
LEFT JOIN v_onedesign_previsions_grouped previsionsOD on previsionsOD.boat = d.boat and previsionsOD.sailOneDesign = d.sailPrefix
LEFT JOIN v_onedesign_max_sequence previsionsODMaxSequence on previsionsODMaxSequence.boat = d.boat and previsionsODMaxSequence.sailOneDesign = d.sailPrefix
where previsionsOD.country is null or previsionsOD.country = previsionsODMaxSequence.country
order by d.boat, d.sailPrefix;

--

alter table previsions add column odAssigned boolean default false;
alter table previsionfulllogs add column odAssigned boolean default false;

alter table previsions add column ownProduction boolean default false;
alter table previsionfulllogs add column ownProduction boolean default false;

update previsions set odAssigned = true where sailOneDesign is not null;
update previsions set odAssigned = false where oneDesign = true and seller = 'ST' and deletedProductionOn is null and (client is null or client = 'ST NSA');;

update previsions set ownProduction = true where oneDesign = true and deletedProductionOn is null;

--

drop table if exists onedesignmodels;

CREATE TABLE onedesignmodels
(
   id int AUTO_INCREMENT PRIMARY KEY,
   boat varchar(64) NOT NULL,
   sail varchar(64) NOT NULL,
   model varchar(64),
   minStock int DEFAULT 0 NOT NULL,
   country varchar(8) NOT NULL,
   nextSequence int,
   line varchar(8) default 'OD'
)ENGINE=MyISAM
;

-- fill table with script updateODModels.js output

update onedesignmodels set model = null where model = 'NULL';


CREATE TABLE onedesignmodelsmeasurements
(
   id varchar(64) PRIMARY KEY,
   modelId int NOT NULL,
   name varchar(32),
   target int,
   maximum int,
   createdOn timestamp
)ENGINE=MyISAM
;

CREATE TABLE onedesignmodelsitems
(
   id varchar(64) PRIMARY KEY,
   modelId int NOT NULL,
   name varchar(32),
   amount int,
   createdOn timestamp DEFAULT CURRENT_TIMESTAMP
)ENGINE=MyISAM
;

-- new fields in prevision for WT
alter table previsions add column wtColor1 varchar(64);
alter table previsionfulllogs add column wtColor1 varchar(64);

alter table previsions add column wtInsignia varchar(64);
alter table previsionfulllogs add column wtInsignia varchar(64);

alter table previsions add column wtRoyalty varchar(64);
alter table previsionfulllogs add column wtRoyalty varchar(64);

alter table previsions add column wtDraft varchar(64);
alter table previsionfulllogs add column wtDraft varchar(64);

alter table previsions add column wtColor2 varchar(64);
alter table previsionfulllogs add column wtColor2 varchar(64);

alter table previsions add column wtSail varchar(64);
alter table previsionfulllogs add column wtSail varchar(64);

alter table previsions add column wtSailNumber varchar(64);
alter table previsionfulllogs add column wtSailNumber varchar(64);