module.exports = function (file,keyword,callback) {
	var csv = require('csv');
	var fs = require('fs');

	function filter (err,d) {
		keyword = keyword.replace(/ /g,"-");
		keyword = keyword.toLowerCase();
		csv.parse(d, function(err, data){
			csv.transform(data,
				function(e){
					if(e[0].toLowerCase().indexOf(keyword)!=-1) {
						if(e[1].indexOf("text/html")!=-1)
							{ return e; }}
				},
				function(err, data){
					var urls = {};
					 	urls.urls = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.content = data[i][1],
							result.statusCode = data[i][2],
							result.status = data[i][3],
							result.hash = data[i][4],
							result.length = data[i][5],
							result.canonical = data[i][6];
						urls.urls.push(result);
					}
					callback(null,urls);
				}
			);
		});
	//console.log("Url filter complete.");
	}

	fs.readFile(file, 'utf8', filter);
};