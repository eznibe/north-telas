-- v5 float a 6 enteros , 2 decimales

alter table djais modify amount decimal(8,2);

alter table previsioncloth modify mts decimal(8,2);

alter table products modify price decimal(8,2);

alter table rolls modify mts decimal(8,2);
alter table rolls modify mtsOriginal decimal(8,2);

alter table manualstock modify mts decimal(8,2);

alter table plotters modify mtsDesign decimal(8,2);

alter table plottercuts modify mtsCutted decimal(8,2);

alter table onedesign modify mts decimal(8,2);

alter table orderproduct modify amount decimal(8,2);
alter table orderproduct modify price decimal(8,2);
