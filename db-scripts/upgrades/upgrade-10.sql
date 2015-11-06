
alter table orders add column inTransitDate date after orderDate;

update orders set inTransitDate = arriveDate;

update orders set inTransitDate = orderDate where arriveDate is null and status = 'IN_TRANSIT';
