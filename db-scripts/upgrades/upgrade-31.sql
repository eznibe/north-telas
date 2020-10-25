-- one design module changes

create view v_onedesign_grouped as
SELECT boat, sailPrefix FROM onedesign group by boat, sailPrefix;

create view v_onedesign_previsions_grouped as
SELECT p.boat, p.sailOneDesign, substring_index(group_concat(distinct p.sailDescription order by p.deliveryDate desc, p.sailDescription desc), ',', 1) as model, p.country
FROM previsions p join v_onedesign_grouped d on p.boat = d.boat and p.sailOneDesign = d.sailPrefix
group by p.boat, p.sailOneDesign;

create view v_onedesign_previsions_newest_grouped as
SELECT max(createdOn) createdOn FROM previsions where oneDesign = true group by boat, sailOneDesign;

create view v_onedesign_max_sequence as
SELECT boat, sailOneDesign, case when SUBSTRING_INDEX(sailDescription, '-', -1) REGEXP '^[0-9]+$' = 1 then SUBSTRING_INDEX(sailDescription, '-', -1) else null end as maxSequence
FROM v_onedesign_previsions_newest_grouped as prevMaxCreation
JOIN previsions p on p.createdOn = prevMaxCreation.createdOn 
where p.oneDesign = true
group by boat, sailOneDesign;

create view v_onedesign_max_sequence_by_model as
SELECT d.boat, d.sailPrefix as sail, previsionsOD.model, previsionsODMaxSequence.maxSequence, coalesce(previsionsOD.country, 'ARG') as country
FROM v_onedesign_grouped d 
LEFT JOIN v_onedesign_previsions_grouped previsionsOD on previsionsOD.boat = d.boat and previsionsOD.sailOneDesign = d.sailPrefix
LEFT JOIN v_onedesign_max_sequence previsionsODMaxSequence on previsionsODMaxSequence.boat = d.boat and previsionsODMaxSequence.sailOneDesign = d.sailPrefix
order by d.boat, d.sailPrefix;


alter table previsions add column odAssigned boolean default false;
alter table previsionfulllogs add column odAssigned boolean default false;

alter table previsions add column ownProduction boolean default false;
alter table previsionfulllogs add column ownProduction boolean default false;

update previsions set odAssigned = true where sailOneDesign is not null;
update previsions set odAssigned = false where oneDesign = true and seller = 'ST' and deletedProductionOn is null;

alter table previsions add column fabricationDate date;
alter table previsionfulllogs add column fabricationDate date;


drop table if exists onedesignmodels;

CREATE TABLE onedesignmodels
(
   id int AUTO_INCREMENT PRIMARY KEY,
   boat varchar(64) NOT NULL,
   sail varchar(64) NOT NULL,
   model varchar(64),
   minStock int DEFAULT 0 NOT NULL,
   country varchar(8) NOT NULL,
   nextSequence int
)ENGINE=MyISAM
;

