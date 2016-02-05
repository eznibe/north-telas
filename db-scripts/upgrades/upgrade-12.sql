
alter table orders add column estimatedArriveDate date after inTransitDate;

update orders set estimatedArriveDate = arriveDate;
