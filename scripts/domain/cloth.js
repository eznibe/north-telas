function sumDjai(cloth) {
              	
	var sum = 0;
	
	if(cloth) {
	  	$.each(cloth.djais, function(idx, d){
	  		sum += new Number(d.amount);
	  	});
	}
  	
  	return sum; 
};