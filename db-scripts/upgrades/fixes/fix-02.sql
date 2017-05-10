-- create plotter and plottercuts for the rolls mts manual corrections (if not present the reports uptoddate is not working correctly to show available mts)

INSERT into plotters (id, plotterDate, clothId, observations, cutted, cuttedOn, cuttedBy, manualPlotterId)
SELECT
uuid(), '2000-01-01', c.id, 'Plotter especial creado manualmente para contener las modificaciones de mts manuales en rollos', true, '2000-01-01', 'script', r.id
FROM rolls r
JOIN products p on p.productId=r.productId
JOIN orders o on o.orderId=r.orderId
JOIN cloths c on c.id=p.clothId
left JOIN providers pro on pro.id=p.providerId
LEFT JOIN
(
   SELECT
   r2.id, sum(pc.mtsCutted) as mtsCutted
   FROM plottercuts pc
   join plotters p on pc.plotterId=p.id
   join rolls r2 on r2.id=pc.rollId
   join cloths c on p.clothId=c.id
   where p.cutted = true
   and p.cuttedOn <= STR_TO_DATE('08-05-2017', '%d-%m-%Y')
   group by r2.id
)
cuts ON cuts.id = r.id
WHERE
r.incoming=false
and o.arriveDate <= STR_TO_DATE('-05-2017', '%d-%m-%Y')
and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) > 0
and r.mts != ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0)));


INSERT INTO plottercuts (id,plotterId,mtsCutted,rollId)
SELECT
uuid(), pl.id, (r.mtsOriginal - coalesce(cuts.mtsCutted, 0)) - r.mts, r.id
FROM rolls r
JOIN products p on p.productId=r.productId
JOIN orders o on o.orderId=r.orderId
JOIN cloths c on c.id=p.clothId
left JOIN providers pro on pro.id=p.providerId
join plotters pl on (pl.clothId = c.id and pl.cuttedBy = 'script' and pl.manualPlotterId = r.id)
LEFT JOIN
(
   SELECT
   r2.id, sum(pc.mtsCutted) as mtsCutted
   FROM plottercuts pc
   join plotters p on pc.plotterId=p.id
   join rolls r2 on r2.id=pc.rollId
   join cloths c on p.clothId=c.id
   where p.cutted = true
   and p.cuttedOn <= STR_TO_DATE('-05-2017', '%d-%m-%Y')
   group by r2.id
)
cuts ON cuts.id = r.id
WHERE
r.incoming=false
and o.arriveDate <= STR_TO_DATE('08-05-2017', '%d-%m-%Y')
and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) > 0
and r.mts != ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0)))
