// parameters for this script are: 
// 1. the directory where you keep the csv files
// 2. the keyword for which you are getting the landing page.
// 3. the landing page url
var landingPage = process.argv[4];
var keyword = process.argv[3];

var urlFilter = require('./urlFilter.js');
var titleFilter = require('./titleFilter.js');
var metaFilter = require('./metaFilter.js');
var h1Filter = require('./h1Filter.js');
var h2Filter = require('./h2Filter.js');
var inLinksFilter = require('./inLinksFilter.js');
var outLinksFilter = require('./outLinksFilter.js');
var inboundLinksFilter = require('./inboundLinksFilter.js');
var async = require('async');
var csv = require('csv');
var fs = require('fs');
var http = require('http');
var concatStream = require('concat-stream');
var cheerio = require('cheerio');


var urlsFile=process.argv[2]+'/uri_all.csv',
	inLinksFile=process.argv[2]+'/all_in_links.csv',
	outLinksFile=process.argv[2]+'/all_out_links.csv',
	h2File=process.argv[2]+'/h2_all.csv',
	h1File=process.argv[2]+'/h1_all.csv',
	titlesFile=process.argv[2]+'/page_titles_all.csv',
	metasFile=process.argv[2]+'/meta_description_all.csv',
	inboundLinksFile=process.argv[2]+'/inbound_links.csv';

async.parallel([	
	function(callback) { urlFilter(urlsFile,process.argv[3],callback)},
	function(callback) { titleFilter(titlesFile,process.argv[3],callback)},
	function(callback) { metaFilter(metasFile,process.argv[3],callback)},
	function(callback) { h1Filter(h1File,process.argv[3],callback)},
	function(callback) { h2Filter(h2File,process.argv[3],callback)},
	function(callback) { inLinksFilter(inLinksFile,process.argv[3],landingPage,callback)},
	function(callback) { outLinksFilter(outLinksFile,process.argv[3],callback)},
	function(callback) { inboundLinksFilter(inboundLinksFile,process.argv[3],landingPage,callback)}
	],
	function(err,results) {
		if (err) {
			console.log('Fail!');
		} else {
			var landingPageScore = 0,
				urlScore = 0,
				titleScore = 0,
				metaScore = 0,
				h1Score = 0,
				h2Score = 0,
				inLinksScore = 0,
				outLinksScore = 0,
				inboundLinksScore = 0,
				textScore = 0;

			for (var i = results.length - 1; i >= 0; i--) {
				if (results[i].hasOwnProperty("urls")) {
					for (var j = results[i]["urls"].length - 1; j >= 0; j--) {
						if (results[i]["urls"][j]["url"] === landingPage) {
							urlScore = 1;
							console.log("Landing Page url contains keyword.");
						}
					}
				} else if (results[i].hasOwnProperty("titles")) {
					for (var k = results[i]["titles"].length - 1; k >= 0; k--) {
						if (results[i]["titles"][k]["url"] === landingPage) {
							console.log("Landing Page title contains keyword.");
							titleScore = 1;
						}
					}

				} else if (results[i].hasOwnProperty("metas")) {
					for (var l = results[i]["metas"].length - 1; l >= 0; l--) {
						if (results[i]["metas"][l]["url"] === landingPage) {
							console.log("Landing Page meta description contains keyword.");
							metaScore = 1;
						}
					}

				} else if (results[i].hasOwnProperty("h1s")) {
					for (var m = results[i]["h1s"].length - 1; m >= 0; m--) {
						if (results[i]["h1s"][m]["url"] === landingPage) {
							console.log("Landing Page h1s contain keyword.");
							landingPageScore = landingPageScore+1;
							h1Score = 1;
						}
					}
				} else if (results[i].hasOwnProperty("h2s")) {
					for (var n = results[i]["h2s"].length - 1; n >= 0; n--) {
						if (results[i]["h2s"][n]["url"] === landingPage) {
							console.log("Landing Page h2s contain keyword.");
							landingPageScore = landingPageScore+1;
							h2Score = 1;
						}
					}
				} else if (results[i].hasOwnProperty("inLinks")) {
					var count = 0;
					var total = 0; 
					if (results[i]["inLinks"][0]) {
						total = results[i]["inLinks"][0]["totalLinks"];
					}
					for (var o = results[i]["inLinks"].length - 1; o >= 0; o--) {
						if (results[i]["inLinks"][o]["destination"] === landingPage) {
							count++;
						}
					}
					inLinksScore = (count/total);
					console.log(count + "/" + total + " internal links to Landing Page contain keyword in anchor.");
				}	else if (results[i].hasOwnProperty("outLinks")) {
					var count = 0;
					for (var p = results[i]["outLinks"].length - 1; p >= 0; p--) {
						if (results[i]["outLinks"][p]["source"] === landingPage) {
							count++;
						}
					}
					if (count>0) {outLinksScore = 1;}
					console.log(count + " outbound links from Landing Page contain keyword in anchor.");
				}	else if (results[i].hasOwnProperty("inboundLinks")) {
					var count = 0;
					var total = 0;
					if (results[i]["inboundLinks"][0]) {
						total = results[i]["inboundLinks"][0]["totalLinks"];}
					for (var q = results[i]["inboundLinks"].length - 1; q >= 0; q--) {
						if (results[i]["inboundLinks"][q]["target"] === landingPage) {
							count++;
						}
					}
					inboundLinksScore = (count/total);
					console.log(count + "/" + total + " external incoming links to Landing Page contain keyword in anchor.");
				}
			}
			function getText(response){
				response.setEncoding('utf8');
				response.pipe(concatStream(function (data) {
						$ = cheerio.load(data.toString());
						var keywordMatches = [],
							h1Matches = [],
							h2Matches = [],
							linkMatches = [];
						$('body').each( function(i,elem) {
							//console.log($(this).text());
							var startIndex = 0,
								index;
							var searchStr = keyword.toLowerCase();
							var str = $(this).text().toLowerCase();
							while ((index = str.indexOf(searchStr, startIndex)) > -1) {
								keywordMatches.push(index);
								startIndex = index + searchStr.length;
							}
						});
						$('h1').each( function(i,elem) {
							if ($(this).text().toLowerCase().indexOf(keyword.toLowerCase())!= -1) {
								h1Matches.push($(this).text());
							}
						});
						$('h2').each( function(i,elem) {
							if ($(this).text().toLowerCase().indexOf(keyword.toLowerCase())!= -1) {
								h2Matches.push($(this).text());
							}
						});
						$('a').each( function(i,elem) {
							if ($(this).text().toLowerCase().indexOf(keyword.toLowerCase())!= -1) {
								linkMatches.push($(this).text());
							}
						})
						textScore = keywordMatches.length - h1Matches.length - h2Matches.length - linkMatches.length;
						console.log("Keyword is used " + textScore + " times in body text.");
						final(textScore);
				}))
			};
			http.get(landingPage,getText);
		}
		function final (textScore) {
			console.log(
				"\n------------------------------\n"+
				"LANDING PAGE RAW SCORES (unweighted):\n" +
				"URL score: " + urlScore + "\n" + 
				"Title score: " + titleScore + "\n" + 
				"Meta score: " + metaScore + "\n" + 
				"H1 score: " + h1Score + "\n" + 
				"H2 score: " + h2Score + "\n" + 
				"Internal Links score: " + inLinksScore + "\n" + 
				"Outbound Links score: " + outLinksScore + "\n" +
				"External Links score: " + inboundLinksScore + "\n" + 
				"Body Text score: " + textScore + " keywords on page."
			);
		};
	}
);