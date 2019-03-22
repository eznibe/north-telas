
ALTER table orders add column dispatch varchar(64);

ALTER TABLE dolar ADD COLUMN id SERIAL PRIMARY KEY;

alter table dolar add column fromDate date;
alter table dolar add column untilDate date;

update dolar set untilDate = null, fromDate = '2018-07-19', createdOn = '2018-07-19 10:26:00' where value = 28;
update dolar set untilDate = '2018-07-18', fromDate = '2017-07-28', createdOn = '2017-07-28 11:22:00' where value = 17.95;
update dolar set untilDate = '2017-07-27', fromDate = '2017-07-05', createdOn = '2017-07-05 15:07:00' where value = 17;
update dolar set untilDate = '2017-07-04', fromDate = '2017-06-23', createdOn = '2017-06-23 10:45:00' where value = 14.75;
update dolar set untilDate = '2016-06-22', fromDate = '2016-05-23', createdOn = '2016-05-23 12:56:00' where value = 14;
update dolar set untilDate = '2016-05-22', fromDate = '2016-03-23', createdOn = '2016-03-23 16:47:00' where value = 15;
update dolar set untilDate = '2016-03-22', fromDate = '2015-06-11', createdOn = '2015-06-11 12:27:00' where value = 9.05;
update dolar set untilDate = '2015-06-10', fromDate = '2014-01-01', createdOn = '2014-01-01 12:00:00' where value = 8.8;

create table inflation 
(
   id SERIAL PRIMARY KEY,
   value int,
   fromDate date,
   toDate date,
   month int,
   year int,
   country varchar(32),
   createdOn timestamp DEFAULT CURRENT_TIMESTAMP
)ENGINE=MyISAM
;


create or replace view v_orders as
SELECT o.*, d.value
FROM orders o, dolar d
WHERE o.arriveDate >= d.createdOn and o.arriveDate <= d.untilDate;

create or replace view v_rolls as
SELECT r.*, op.price
FROM rolls r join orderproduct op on r.productId = op.productId and r.orderId = op.orderId;