
-- order product type can be set individually
alter table orderproduct add column temporary boolean DEFAULT false;