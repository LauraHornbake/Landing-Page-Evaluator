// parameters for this script are: 
// 1. the directory where you keep the csv files
// 2. the keyword for which you are getting the landing page.
var landingPage = 'http://example.com';  // this is a remnant of the previous code for landing page evaluator.  TODO: find a way to safely remove it from filter modules without breaking the evaluator (landing.js)?
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

var urlsFile=process.argv[2]+'/uri_all.csv',
	inLinksFile=process.argv[2]+'/all_inlinks.csv',
	outLinksFile=process.argv[2]+'/all_outlinks.csv',
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
			var urls = [],
				titles = [],
				metas = [],
				h1s = [],
				h2s = [],
				inlinks = [],
				outlinks = [],
				inbndlinks = [],
				allPages = [];

			for (var i = results.length - 1; i >= 0; i--) {
				if (results[i].hasOwnProperty("urls")) {
					for (var j = results[i]["urls"].length - 1; j >= 0; j--) {
						urls.push(results[i]["urls"][j]["url"])
					}
				} else if (results[i].hasOwnProperty("titles")) {
					for (var k = results[i]["titles"].length - 1; k >= 0; k--) {
						titles.push(results[i]["titles"][k]["url"]);
					}

				} else if (results[i].hasOwnProperty("metas")) {
					for (var l = results[i]["metas"].length - 1; l >= 0; l--) {
						metas.push( results[i]["metas"][l]["url"]);
					}

				} else if (results[i].hasOwnProperty("h1s")) {
					for (var m = results[i]["h1s"].length - 1; m >= 0; m--) {
						h1s.push(results[i]["h1s"][m]["url"]);
					}
				} else if (results[i].hasOwnProperty("h2s")) {
					for (var n = results[i]["h2s"].length - 1; n >= 0; n--) {
						h2s.push(results[i]["h2s"][n]["url"]); 
					}
				} else if (results[i].hasOwnProperty("inLinks")) {;
					for (var o = results[i]["inLinks"].length - 1; o >= 0; o--) {
						inlinks.push(results[i]["inLinks"][o]["destination"]);

					}
				}	else if (results[i].hasOwnProperty("outLinks")) {
					for (var p = results[i]["outLinks"].length - 1; p >= 0; p--) {
						outlinks.push(results[i]["outLinks"][p]["source"]);						
					}
				}	else if (results[i].hasOwnProperty("inboundLinks")) {
					for (var q = results[i]["inboundLinks"].length - 1; q >= 0; q--) {
						inbndlinks.push(results[i]["inboundLinks"][q]["target"]);
				}
			}
		}
		var allArrays = urls.concat(titles,metas,h2s,h1s,inlinks,outlinks,inbndlinks);
		var results = [];
		var allPages;
		for (var i = allArrays.length - 1; i >= 0; i--) {
				if(allPages.indexOf(allArrays[i]) == -1) {
					allPages.push(allArrays[i]);
				}
		};
		for (var i = 0; i < allPages.length; i++) {
				var page = {};
					page.url = allPages[i];
					page.score = 0;
					page.summary = [];				
				if(urls.indexOf(allPages[i])!=-1) { page.summary.push("Keyword is in URL."); page.score+=1.25;};
				if(titles.indexOf(allPages[i])!=-1) {page.summary.push("Keyword is in Page Title."); page.score+=1.25;};
				if(metas.indexOf(allPages[i])!=-1) {page.summary.push("Keyword is in Meta Description."); page.score+=1.25;};
				if(h1s.indexOf(allPages[i])!=-1) {page.summary.push("Keyword is in H1s."); page.score+=1.25;};
				if(h2s.indexOf(allPages[i])!=-1) { page.summary.push("Keyword is in H2s."); page.score+=1.25;};
				if(inlinks.indexOf(allPages[i])!=-1) { page.summary.push("Keyword is in Internal Links to Page."); page.score+=1.25;};
				if(outlinks.indexOf(allPages[i])!=-1) { page.summary.push("Keyword is in Link Anchors on Page."); page.score+=1.25;};
				if(inbndlinks.indexOf(allPages[i])!=-1) { page.summary.push("Keyword is in External Inbound Links to Page."); page.score+=1.25;};
				results.push(page);
		};
		results.sort(function(a,b){
			return a.score - b.score;
		});
		results.reverse();
		console.log("There are "+allPages.length+" possible landing pages:");
		console.log(JSON.stringify(results, null, '\t'));
	}
});