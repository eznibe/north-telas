
alter table previsions add column designedOn date;

alter table previsions add column createdOn timestamp default CURRENT_TIMESTAMP;

update previsions set createdOn = now() where year(createdOn)!=2015 and designed=false; --NOT RUN IN PROD YET

update previsions set createdOn = designedOn where designed=true; --NOT RUN IN PROD YET

-- action: 0, created, 1 modified, 2 deleted
create table previsionLogs (
	id varchar(64),
	previsionId varchar(64),
	clothId varchar(64),
	mts decimal,
	action int,
	date timestamp default CURRENT_TIMESTAMP
)ENGINE=MyISAM;

alter table previsionLogs add column user varchar(64); --NOT RUN IN PROD YET
update previsionlogs set user = 'by-script'; --NOT RUN IN PROD YET

alter table previsionLogs add column id varchar(64); --NOT RUN IN PROD YET
update previsionlogs set id = UUID(); --NOT RUN IN PROD YET

insert into previsionlogs (previsionId, clothId, mts, action, user)
 select previsionId, clothId, mts, 0, 'script'
 from previsioncloth pc join previsions p on p.id = pc.previsionId
 where p.designed = false;

--NOT RUN IN PROD YET
insert into previsionlogs (previsionId, clothId, mts, action, user, date)
 select previsionId, clothId, mts, 0, 'script', p.createdOn
 from previsioncloth pc join previsions p on p.id = pc.previsionId
 where p.designed = false;


UPDATE previsions pre
   JOIN plotters p ON pre.id = p.previsionId
   SET pre.designedOn = p.plotterDate
   where pre.designed = true;

-- UP TO HERE IN PROD
-- clear of old data and products with zz code

update previsions set designedOn = deliveryDate where designed=true and designedOn is null;


delete from products where productId = '594dd21e-7aef-4edd-eeee-113fd83f994c';


UPDATE rolls r join products p on r.productId = p.productId
	join (select * from products sp where sp.providerId != 'zz') p2 on p2.clothId = p.clothId
   SET r.productId = p2.productId
   WHERE p.providerId = 'zz';

delete from products where providerId = 'zz';


delete FROM cloths where id = '14036795-4777-4500-d28e-b83c4dac6cd6';

delete from plotters where clothId = '14036795-4777-4500-d28e-b83c4dac6cd6';

delete FROM plottercuts where plotterId in ('5503207f011b7','8070dde2-06d3-4967-d54b-dce36e17e73b','55929f104b1cc');

delete from rolls where id in ('5f526bf4-e51f-4fc2-87c6-2adc23f233e1','602c3353-0e0e-4fa8-cc6f-4c71e0086338');

delete FROM products where clothId = '14036795-4777-4500-d28e-b83c4dac6cd6';
