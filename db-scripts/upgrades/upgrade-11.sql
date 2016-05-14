
alter table previsions add column state varchar(16);
alter table previsions add column prevState varchar(16);
alter table previsions add column stateAccepted boolean default true;
alter table previsions add column stateChanged timestamp;
alter table previsions add column stateAcceptedDate timestamp;

update previsions set stateChanged = createdOn, stateAcceptedDate = createdOn;


update previsions set createdOn = createdOn + (FLOOR(RAND() * (50 - 10 + 1)) + 10)
where createdOn = '2015-09-09 23:51:08.0' and designed=false;
