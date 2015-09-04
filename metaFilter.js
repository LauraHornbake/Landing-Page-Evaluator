module.exports = function (file,keyword,callback) {
	var csv = require('csv');
	var fs = require('fs');

	function filter (err,d) {
		keyword = keyword.toLowerCase();
		csv.parse(d, function(err, data) {
			csv.transform(data,
				function(s){
					if (s[2]) {
						if (s[2].toLowerCase().indexOf(keyword)!=-1) {
							return s;
						}
					}
				},
				function(err, data){
					var metas = {};
						metas.metas = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.occurrences = data[i][1],
							result.metaDescription1 = data[i][2],
							result.meta1Length = data[i][3],
							result.meta1PixelWidth = data[i][4];
						metas.metas.push(result);
					}
					callback(null,metas);
				}
			);
		});
	//console.log("Meta description filter complete.");	
	}
	fs.readFile(file, 'utf8', filter);
};