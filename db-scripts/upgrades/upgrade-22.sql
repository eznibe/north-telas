

ALTER TABLE previsions add column designer varchar(32);

ALTER TABLE previsions add column designWeek int;

ALTER TABLE previsions add column designHours decimal(4,1);

ALTER TABLE previsions add column designOnly boolean default false;

ALTER TABLE previsions add column designOnlyCloth varchar(256);

-- ALTER TABLE previsions add column canvas boolean default false;


ALTER TABLE previsionfulllogs add column designer varchar(32);

ALTER TABLE previsionfulllogs add column designWeek int;

ALTER TABLE previsionfulllogs add column designHours decimal(4,1);

ALTER TABLE previsionfulllogs add column designOnly boolean default false;

ALTER TABLE previsionfulllogs add column designOnlyCloth varchar(256);

-- ALTER TABLE previsionfulllogs add column canvas boolean default false;
