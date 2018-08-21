
alter table temporariesfile add column using5percLoss boolean default false; 

update temporariesfile set using5percLoss=true;

update temporariesfile set using5percLoss=false where id not in (SELECT id FROM v_temporaries_files_extended where available = 0);