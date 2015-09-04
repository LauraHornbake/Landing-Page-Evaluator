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
					var h2s = {};
						h2s.h2s = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.occurrences = data[i][1],
							result.h21 = data[i][2],
							result.h21Length = data[i][3];
						h2s.h2s.push(result);
					}
					callback(null,h2s);
				}
			);
		});
	//console.log("H2 filter complete");

	}
	fs.readFile(file, 'utf8', filter);
};