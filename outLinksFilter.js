module.exports = function (file,keyword,callback) {
	var csv = require('csv');
	var fs = require('fs');

	function filter (err,d) {
		keyword = keyword.toLowerCase();
		csv.parse(d, function(err, data){
			csv.transform(data,
				function(s){
					if (s[4]) {
						if (s[0]==="HREF" && s[4].toLowerCase().indexOf(keyword)!=-1) {
							return s;
						}
					}
				},
				function(err, data){
					var outLinks = {};
						outLinks.outLinks = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.type = data[i][0],
							result.source = data[i][1],
							result.destination = data[i][2],
							result.altText = data[i][3],
							result.anchor = data[i][4],
							result.statusCode = data[i][5],
							result.status = data[i][6],
							result.follow = data[i][7];
						outLinks.outLinks.push(result);
					}
					callback(null,outLinks);
				}
			);
		});
	}

	fs.readFile(file, 'utf8', filter);
};