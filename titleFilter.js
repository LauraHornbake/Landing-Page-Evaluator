module.exports = function (file,keyword,callback) {
	var csv = require('csv');
	var fs = require('fs');

	function filter (err,d) {
		csv.parse(d, function(err, data) {
			csv.transform(data,
				function(s){
					keyword = keyword.toLowerCase();
					if (s[2]) {
						if (s[2].toLowerCase().indexOf(keyword)!=-1) {
							return s;
						}
					}
				},
				function(err, data){
					var titles = {};
						titles.titles = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.occurrences = data[i][1],
							result.title1 = data[i][2],
							result.title1Length = data[i][3],
							result.title1PixelWidth = data[i][4];
						titles.titles.push(result);
					}
					callback(null,titles);
				}
			);
		});
	//console.log("Page title filter complete.");
	}
	fs.readFile(file, 'utf8', filter);
};