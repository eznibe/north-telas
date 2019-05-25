
alter table orders add column dolar decimal(5,2);

update orders o, v_orders v set o.dolar = v.value where o.number = v.number

alter table inflation add column value_bkp int;
update inflation set value_bkp = value;
alter table inflation drop column value;
alter table inflation add column value decimal(5,2);
update inflation set value = value_bkp;
alter table inflation drop column value;