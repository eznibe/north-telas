
alter table orders add column dolar decimal(5,2);

update orders o, v_orders v set o.dolar = v.value where o.number = v.number

alter table inflation add column value_bkp int;
update inflation set value_bkp = value;
alter table inflation drop column value;
alter table inflation add column value decimal(5,2);
update inflation set value = value_bkp;
alter table inflation drop column value;


--- 26-b


alter table temporariesfile add column using5percLoss boolean default false; 

update temporariesfile set using5percLoss=true;

update temporariesfile set using5percLoss=false where id not in (SELECT id FROM v_temporaries_files_extended where available = 0);


