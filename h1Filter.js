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
						} else {
							if (s[4].toLowerCase().indexOf(keyword)!=-1){
								return s;
							}
						}
					}
				},
				function(err, data){
					var h1s = {};
						h1s.h1s = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.occurrences = data[i][1],
							result.h11 = data[i][2],
							result.h11Length = data[i][3],
							result.h12 = data[i][4],
							result.h12Length = data[i][5];
						h1s.h1s.push(result);
					}
					callback(null,h1s);
				}
			);
		});
	}
	fs.readFile(file, 'utf8', filter);
};