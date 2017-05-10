-- remove duplicates plotters created for the same prevision cloth (dump 170508.sql)

delete from plotters where id in (
'590ccda7260cd','590ccdafc4620','590ccdbe063ce','590ccdc0bacb1','590ccdc1a1610','590ccdd5f1479',
'590ccdd7546a7','590ccdd99aed4','590ccddb8d3fb','590ccddc5ca12','590ccdddd3c54','590cce0a6efe6',
'590cce0b4ebf3','590cce0b8ef69','590cce0d32181','590cce0e72329','590cce0fe73a1','590cce1082c0e',
'590cce10896a5','590cce11093ec','590cce11b00e0','590cce129a9ca','590cce24da9ba','590cce51d56de',
'590cce52708f0'
);
