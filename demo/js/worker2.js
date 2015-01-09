onmessage = function(e){
	var increment = e.data[1];
	var rows = e.data[0].node.childNodes;
	var length = rows.length;
	for (var i = 0; i < length; i++){
		rows[i].childNodes[0].nodeValue = parseInt(rows[i].childNodes[0].nodeValue, 10) + increment;
	}
	postMessage(e.data[0]);
};