module.exports = function (file,keyword,landingPage,callback) {
	var csv = require('csv');
	var fs = require('fs');

	function filter (err,d) {
		keyword = keyword.toLowerCase();
		totalLinks = 0;
		csv.parse(d, function(err, data){

			csv.transform(data,
				function(s){
					if (s[1]) {
						if (s[8] === landingPage) {
							totalLinks++;
						}
					}
					if (s[1]) {
						if (s[2].toLowerCase().indexOf(keyword)!=-1) {
							return s;
						}
					}

				},
				function(err, data){
					var inboundLinks = {};
						inboundLinks.inboundLinks = [];
					for (var i = 0; i<data.length; i++){
						var result = {};
							result.url = data[i][0],
							result.title = data[i][1],
							result.anchor = data[i][2],
							result.pageAuthority = data[i][3],
							result.domainAuthority = data[i][4],
							result.domainsLinkingToPage = data[i][5],
							result.domainsLinkingToDomain = data[i][6]
							result.origin = data[i][7],
							result.target = data[i][8],
							result.linkEquity = data[i][9],
							result.noLinkEquity = data[i][10],
							result.onlyNoFollow = data[i][11],
							result.onlyFollow = data[i][12],
							result.redirect301 = data[i][13],
							result.totalLinks = totalLinks;
						inboundLinks.inboundLinks.push(result);
					}
					callback(null,inboundLinks);
				}
			);
		});
	}

	fs.readFile(file, 'utf8', filter);
};