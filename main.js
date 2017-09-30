/*All of the modules required*/
var firebase = require("firebase");
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

/*All of the global variables*/

var database;
var sitesRef;
var sitesToVisitRef;
var relativeLinks;

/*The config function*/
exports.config = function(config) {
    firebase.initializeApp(config);
    database = firebase.database();
}

/*The pathSet function*/
exports.pathSet = function(sites, sitesToVisit) {
    sitesRef = firebase.database().ref(sites);
    sitesToVisitRef = firebase.database().ref(sitesToVisit);

};

/*The databaseTest function*/
exports.databaseTest = function() {
    var randomTestRefValue;
    if (database !== null) { /*if the database works*/
        firebase.database().ref('randomTestRef').set({
            value: 1
        });
        console.log("initial database set");
        firebase.database().ref('randomTestRef').once('value', function(snapshot) {
            randomTestRefValue = snapshot.val().value;
            randomTestRefValue = randomTestRefValue + 1;
            console.log("set appears to have worked");
            firebase.database().ref('randomTestRef').set({
                value: randomTestRefValue
            });
            console.log("second success");
            firebase.database().ref('randomTestRef').once('value', function(snapshot) {
                if (snapshot.val().value === 2) {
                    console.log("all set!");
                } else {
                    console.log("There's a problem");
                }
            });
        });
    } else { /*otherwise throw error*/
        console.log("Database not working");
    }
}; /*End of exports.databaseTest*/


/*Function siteContained*/

exports.siteContained = function(url, baseOnly) {
    var inputUrl = new URL(url);
    var inputUrlHostname = inputUrl.hostname;
    var inputUrlHostnameKey = inputUrlHostname.replace(/\./g, '-');
    var inputUrlPath = inputUrl.pathname;
    var inputUrlPathKey = inputUrlPath.replace(/\//g, '-');
    sitesRef.once("value")
        .then(function(snapshot) {
            if (baseOnly) {
                if (snapshot.child(inputUrlHostnameKey).exists()) {
                    console.log("baseUrlContained");
                    return true;
                } else {
                    return false;
                }
            } else { /*if not baseOnly*/
                if (snapshot.child(inputUrlHostnameKey + "/pages/" + inputUrlPathKey).exists()) {
                    console.log("regUrlContained");
                    return true;
                } else {
                    return false;
                }
            }
        });
};


/*Function siteToVisitContained*/

exports.siteToVisitContained = function(url, baseOnly) {
    var inputUrl = new URL(url);
    var inputUrlHostname = inputUrl.hostname;
    var inputUrlHostnameKey = inputUrlHostname.replace(/\./g, '-');
    var inputUrlPath = inputUrl.pathname;
    var inputUrlPathKey = inputUrlPath.replace(/\//g, '-');
    sitesToVisitRef.once("value")
        .then(function(snapshot) {
            if (baseOnly) {
                if (snapshot.child(inputUrlHostnameKey).exists()) {
                    console.log("baseUrlContained");
                    return true;
                } else {
                    return false;
                }
            } else { /*if not baseOnly*/
                if (snapshot.child(inputUrlHostnameKey + "/" + inputUrlPathKey).exists()) {
                    console.log("regUrlContained");
                    return true;
                } else {
                    return false;
                }
            }
        });
};

/*queueSiteIfNotContained function*/

exports.queueSiteIfNotContained = function(url, baseOnly) {

    var inputUrl = new URL(url);
    var inputUrlHostname = inputUrl.hostname;
    var inputUrlHostnameKey = inputUrlHostname.replace(/\./g, '-');
    var inputUrlPath = inputUrl.pathname;
    var inputUrlPathKey = inputUrlPath.replace(/\//g, '-');
    if (!exports.siteToVisitContained(url, baseOnly)) {
        if (!exports.siteContained(url, baseOnly)) {
            sitesToVisitRef.child(inputUrlHostnameKey + "/" + inputUrlPathKey).set({
                url: url
            });
        }
    }
}


/*Queue Internal Links Function*/

exports.collectInternalLinks = function($, baseOnly, baseUrl) {

    var relativeLinks = $("a[href^='/']");

    if (!baseOnly) {
      if(relativeLinksTrue) {
        relativeLinks.each(function() {
            exports.queueSiteIfNotContained(baseUrl + $(this).attr('href'));

        });
      }
    }

    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function() {
        exports.queueSiteIfNotContained($(this).attr('href'));
    });

}; /*End of Queue Internal Links Function*/

/*Get Site Function*/

exports.getSite = function(url, baseOnly) {
    var inputUrl = new URL(url);
    var inputUrlHostname = inputUrl.hostname;
    var inputUrlHostnameKey = inputUrlHostname.replace(/\./g, '-');
    var inputUrlPath = inputUrl.pathname;
    var inputUrlPathKey = inputUrlPath.replace(/\//g, '-');
    var baseUrl = url.protocol + "//" + url.hostname;
    sitesToVisitRef.child(inputUrlHostnameKey + "/" + inputUrlPathKey).remove();
    request(url, function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        /*console.log('body:', body); // Print the HTML for the Google homepage. ONLY FOR TESTING*/

        var $ = cheerio.load(body);
        var title = $('title').text();
        var description = $('meta[name="description"]').attr('content');
        sitesRef.child(inputUrlHostnameKey + "/pages/" + inputUrlPathKey).set({
            title: title
        }).then(function() {
            /*Add description later*/
            exports.collectInternalLinks($, baseOnly, baseUrl);
        });
    }); /*End of request function*/
    exports.goToNextSite(baseOnly);
}; /*end of getSite*/

/*goToNextSite function*/
exports.goToNextSite = function(baseOnly) {
    var firstKey;
    var maybeNextUrl;
    var nextUrl;
    sitesToVisitRef.limitToFirst(1).once('value', function(snapshot) {
        for (var key in snapshot.val()) {
            console.log("snapshot key" + key);
            console.log("snapshot.val.url = " + snapshot.val()[key].url);
            console.log("snapshot.val" + snapshot.val()[key]);
            firstKey = key;
            console.log("first key: " + firstKey);
            maybeNextUrl = snapshot.val()[key].url;
            console.log("maybe next url: " + maybeNextUrl);
        }
    }).then(function() {
        if (maybeNextUrl !== undefined) {
            nextUrl = maybeNextUrl;
        } else {
            sitesToVisitRef.child(firstKey).once('value', function(snapshot) {
                if (snapshot.hasChildren()) {
                    console.log("snapshot has children");
                    for (var key in snapshot.val()) {
                        console.log("snapshot key" + key);
                        console.log("snapshot.val.url = " + snapshot.val()[key].url);
                        console.log("snapshot.val" + snapshot.val()[key]);
                        nextUrl = snapshot.val()[key].url;
                        console.log("next url: " + nextUrl);
                    }
                }
            });
        }
    }).then(function() {
      exports.getSite(nextUrl);
    });
};


/*Main Spider Function*/
exports.spider = function(startUrl, baseOnly, relativeLinksTrueParam) {
    if (relativeLinksTrueParam === true ||relativeLinksTrueParam === false) {
    relativeLinksTrue = relativeLinks;
    } else {
    relativeLinksTrue = false;
    }
    exports.queueSiteIfNotContained(startUrl, baseOnly);
    exports.goToNextSite(baseOnly);
};
