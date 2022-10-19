-- one design module changes


create or replace view v_onedesign_max_sequence as
SELECT p.boat, p.sailOneDesign, p.country, max(case when SUBSTRING_INDEX(sailDescription, '-', -1) REGEXP '^[0-9]+$' = 1 then SUBSTRING_INDEX(sailDescription, '-', -1) else null end) as maxSequence
FROM v_onedesign_previsions_newest_grouped as prevMaxCreation
JOIN previsions p on p.createdOn = prevMaxCreation.createdOn and p.boat = prevMaxCreation.boat and p.sailOneDesign = prevMaxCreation.sailOneDesign and p.country = prevMaxCreation.country 
where p.oneDesign = true
group by p.boat, p.sailOneDesign, p.country;


create or replace view v_cloths_stock as 
SELECT c.*, coalesce(h.stockInHouse, 0) as stockInHouse, coalesce(t.in_transit, 0) as stockInTransit, coalesce(tt.in_transit, 0) as stockTemporariesInTransit, temp.temporaryAvailable, temp.temporaryAvailableWithLoss, 
coalesce(export_cutted.mtscutted, 0) as toExportCutted, coalesce(temp_to_cut.mtsToCut, 0) as temporariesToCut, 
coalesce(coalesce(h.stockInHouse, 0) - (temp.temporaryAvailable - coalesce(export_cutted.mtscutted, 0)), 0) as stockCompare
FROM cloths c 
left join v_cloths_in_house_stock h on h.clothid = c.id
left join v_cloths_in_transit_stock t on t.clothid = c.id
left join v_cloths_temporaries_in_transit_stock tt on tt.clothid = c.id 
left join v_cloths_with_temporary_stock temp on temp.id = c.id
left join v_cloths_to_export_cutted_stock export_cutted on export_cutted.clothid = c.id
left join v_cloths_to_cut_temporaries temp_to_cut on temp_to_cut.clothid = c.id;