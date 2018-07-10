
-- order product type can be set individually
alter table orderproduct add column temporary boolean DEFAULT false;


CREATE TABLE temporariesdispatch
(
   id varchar(64) PRIMARY KEY NOT NULL,
   description varchar(32),
   shortName varchar(16),
   dueDate date,
   realDueDate date,
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;

CREATE TABLE temporariesfile
(
   id varchar(64) PRIMARY KEY NOT NULL,
   dispatchId varchar(64),
   productId varchar(64),
   mtsInitial decimal(8,2),
   cif decimal(8,2),
   arancelary varchar(64), -- remove from here and add to the cloth
   type varchar(32), -- cloth type (group name)
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;

CREATE TABLE temporariesdownload
(
   id varchar(64) PRIMARY KEY NOT NULL,
   fileId varchar(64),
   description varchar(128),
   mts decimal(8,2),
   downloadDate date,
   country varchar(64),
   orderNumber varchar(64),
   downloadedBy varchar(64),
   insertedOn timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)ENGINE=MyISAM
;



create or replace view v_temporaries_files_extended as
SELECT f.*, coalesce(sum(dw.mts),0) as used, ((f.mtsInitial * 0.95) - coalesce(sum(dw.mts),0)) * 1.0526 as available, ((f.mtsInitial * 0.95) - coalesce(sum(dw.mts),0)) as availableWithLoss 
FROM temporariesfile f left join temporariesdownload dw on dw.fileId = f.id
GROUP by f.id;
	

create or replace view v_temporaries_dispatch_extended as
SELECT d.*, sum(f.mtsInitial) as init, coalesce(sum(f.used),0) as used, sum(f.available) as available 
FROM temporariesdispatch d left join v_temporaries_files_extended f on d.id = f.dispatchId
GROUP by d.id;


create or replace view v_cloths_with_temporary_stock as
SELECT c.*, coalesce(sum(f.available), 0) as temporaryAvailable, coalesce(sum(f.availableWithLoss), 0) as temporaryAvailableWithLoss
FROM cloths c 
join products p on p.clothId=c.id 
left join v_temporaries_files_extended f on f.productId=p.productId 
GROUP by c.id, c.name;


alter table temporariesfile add column type_2 varchar(32);

update temporariesfile set type_2=type, type = null;

alter table temporariesfile add column rollWidth decimal(8,2);

--

update temporariesfile set arancelary=null where arancelary='';

alter table cloths add column arancelary varchar(32);

update cloths set arancelary = '5407.10.19.100X' where groupId=1;

update cloths set arancelary = '3921.90.90.900J' where groupId=2;

UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '41';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '42';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '43';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '245';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '248';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'febf7744-ddfd-482b-e605-174b949cd2c6';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'e726a1ac-c305-4c66-ccb5-19f3b83007ea';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '4748c8ea-7c56-4f2b-c888-5679ad7579ae';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '75255737-a446-4870-e44a-265179588f86';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'c6638d4f-9045-40af-dd70-98785246db77';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '8b0d9de8-4dff-4bcf-a2e2-b939cb3c89c8';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '7b313dd5-8b5b-414b-8743-e7f3303d65a0';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'b0734d9a-5bd1-4c8b-b529-06fd1d881310';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '526c5254-eb3e-4554-9179-0b39c7c56e13';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '61';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '62';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '60';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '50';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '51';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '55';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '56';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '58';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '59';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '63';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '57';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '40';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '146';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '147';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '148';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'a6d44911-6b39-4cbe-f359-ac7444fd4490';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '149';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '150';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '9eee7266-c182-4fa9-b3c3-3162b4e75fbe';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '153';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '151';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '152';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '154';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '44';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '156';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '155';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '157';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = 'f69882ba-f5be-4641-e391-d71881e7460d';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '957b35e6-cb49-4d8c-a754-dd29c0cad9ef';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '165';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '166';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = '77';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '109';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '110';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '111';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = '65';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = '136';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = '135';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = '145';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '08bc2dac-1c28-4363-b452-8359f5332a94';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = 'e75415b3-f694-4a99-b6f5-172478b0e4f5';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '43dabba8-63a2-4fdf-ba0a-3c5c67c8b339';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '182';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '1ff4ce6b-9cda-4e60-e82c-1e2f024506ed';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '183';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '5004facf-af11-4ae4-f41f-7cdb7688c59d';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '174';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '175';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '176';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '1b10c18f-e588-4137-cfe7-c0d2ac2eac2d';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '177';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '178';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '179';
UPDATE cloths SET arancelary = '5407.41.00.910E' WHERE id = '181';
UPDATE cloths SET arancelary = '5407.42.00.941U' WHERE id = '08868a73-9d52-4e9e-b074-5e0a4e155677';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = '88';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = 'aa64859c-bc68-4c9b-a893-865ecd788c26';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = '9259d1d0-753b-4093-f879-cebed6bde531';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = '68725435-6862-4ca3-c591-15f53035d163';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = 'a79182f2-43cc-47dd-9c13-95411c32f736';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = 'fbd5a9be-05b4-4102-ad4f-62cf5de0c7d1';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = 'e67c801c-a1fa-4902-ada4-a79ece7001b0';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = 'cf679b77-999e-4eb3-d44c-6438580188ae';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = 'ab70fdd3-a529-41eb-dabe-e5b135b43999';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '7ed5e821-f5b0-4471-c266-167a33da88c4';
UPDATE cloths SET arancelary = '3921.90.90.900J' WHERE id = '5fd1df55-69dc-4d16-e95a-083959edc92f';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '200bad3b-d95d-47b1-b157-9b29b5818430';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = 'c677f9a1-a42c-4f0a-c5a0-cb0d72477653';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = '64';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = 'e8064331-bc13-4fb7-fa5c-ac7462dbf131';
UPDATE cloths SET arancelary = '5407.10.19.100X' WHERE id = 'df5e9ffe-e26e-4d29-c344-320e33b64867';
UPDATE cloths SET arancelary = '5903.90.00.919G' WHERE id = 'd5bb0b4b-2011-4b88-ff15-2a7a018c7333';

--

alter table usuarios add column temporaries boolean default false;


create or replace view v_cloths_in_transit_stock as
SELECT c.*, c.id as clothid, coalesce(sum(if(o.status = 'IN_TRANSIT', op.amount, 0)), 0) as in_transit
FROM cloths c LEFT JOIN products pro on pro.clothId=c.id LEFT JOIN orderproduct op on op.productId=pro.productId LEFT JOIN orders o on o.orderId=op.orderId
WHERE o.status != 'ARRIVED'
group by c.id;

create or replace view v_cloths_temporaries_in_transit_stock as
SELECT c.*, c.id as clothid, coalesce(sum(if(o.status = 'IN_TRANSIT' and o.deliveryType like 'Aereo%', op.amount, 0)), 0) as in_transit
FROM cloths c LEFT JOIN products pro on pro.clothId=c.id LEFT JOIN orderproduct op on op.productId=pro.productId LEFT JOIN orders o on o.orderId=op.orderId
WHERE o.status != 'ARRIVED' and op.temporary = true
group by c.id;

create or replace view v_cloths_in_house_stock as
SELECT c.*, c.id as clothid, coalesce(sum(r.mts), 0) as stockInHouse
FROM cloths c 
LEFT JOIN products p on p.clothId=c.id 
left join rolls r on r.productId = p.productId
WHERE r.mts > 0 and r.incoming = false
group by c.id;


create or replace view v_cloths_to_export_cutted_stock as
SELECT pl.clothId, count(*), coalesce(sum(pcuts.mtsCutted), 0) as mtscutted
FROM previsions p 
left join plotters pl on pl.previsionId = p.id
left join plottercuts pcuts on pcuts.plotterId = pl.id
WHERE p.priority = 2 and p.percentage >= 25 and p.deletedProductionOn is null
group by pl.clothId;

create or replace view v_cloths_to_cut_temporaries as
SELECT c.*, c.id as clothid, coalesce(sum(pc.mts), 0) as mtsToCut
FROM cloths c 
LEFT JOIN previsioncloth pc on pc.clothId=c.id
LEFT JOIN previsions p on p.id=pc.previsionId
WHERE (p.type = 'TEMP' OR p.priority = 2) and p.percentage < 25
group by c.id;


create or replace view v_cloths_stock as
SELECT c.*, coalesce(h.stockInHouse, 0) as stockInHouse, coalesce(t.in_transit, 0) as stockInTransit, coalesce(tt.in_transit, 0) as stockTemporariesInTransit, temp.temporaryAvailable, temp.temporaryAvailableWithLoss, 
coalesce(export_cutted.mtscutted, 0) as toExportCutted, coalesce(temp_to_cut.mtsToCut, 0) as temporariesToCut, 
coalesce(coalesce(h.stockInHouse, 0) - (temp.temporaryAvailable - coalesce(export_cutted.mtscutted, 0)), 0) as stockCompare
FROM cloths c 
join products p on p.clothId=c.id 
left join v_cloths_in_house_stock h on h.clothid = c.id
left join v_cloths_in_transit_stock t on t.clothid = c.id
left join v_cloths_temporaries_in_transit_stock tt on tt.clothid = c.id 
left join v_cloths_with_temporary_stock temp on temp.id = c.id
left join v_cloths_to_export_cutted_stock export_cutted on export_cutted.clothid = c.id
left join v_cloths_to_cut_temporaries temp_to_cut on temp_to_cut.clothid = c.id
GROUP by c.id, c.name;