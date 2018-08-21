
insert into roles values (8, 'compras');


CREATE INDEX pc_plotterid_idx ON plottercuts(plotterId);
CREATE INDEX pc_rollid_idx ON plottercuts(rollId);

CREATE INDEX r_productid_idx ON rolls(productId);
CREATE INDEX r_orderid_idx ON rolls(orderId);

CREATE INDEX p_providerid_idx ON products(providerId);	
CREATE INDEX p_clothid_idx ON products(clothId);