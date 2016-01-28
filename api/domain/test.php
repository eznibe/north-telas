<?php

$array = array();

$array[0]->id = 'one';
$array[0]->color = 'white';
$array[1]->id = 'two';
$array[1]->color = 'red';
$array[2]->id = 'three';
$array[2]->color = 'blue';


$row = findObjectById('two', $array);

echo $row->color;

$row->color = 'black';

echo $array[1]->color;

function findObjectById($id, $array){

    foreach ( $array as $element ) {
        if ( $id == $element->id ) {
            return $element;
        }
    }

    return false;
}

$clothId= 1;
$prevision->deliveryDate = '2015-01-01';
$prevision->createdOn = '2015-05-05';
$query = "SELECT pre.* FROM previsions pre JOIN previsioncloth pc on pc.previsionId = pre.id
          WHERE pre.designed = false AND pc.clothId = '$clothId'
            AND pre.deliveryDate <= ".$prevision->deliveryDate." AND pre.createdOn < ".$prevision->createdOn."
          GROUP BY pre.id
          ORDER BY pre.deliveryDate, pre.createdOn";

          echo $query;

?>
