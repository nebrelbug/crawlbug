# Crawlbug
[![Build Status](https://travis-ci.org/nebrelbug/crawlbug.svg?branch=master)](https://travis-ci.org/nebrelbug/crawlbug)

Crawlbug is a web-crawler NPM module that is designed to be integrated with a Firebase realtime database. Though this was mainly a project for myself, feel free to contact me if you'd like to contribute.

Basic use:

Require crawlbug

```

var crawlbug = require("crawlbug");

```

Start a crawl

```

crawlbug.config({
    apiKey: "myVeryLongAp1key",
    authDomain: "probablysomething.firebaseapp.com",
    databaseURL: "https://probablysomething.firebaseio.com",
    projectId: "projectId",
    storageBucket: "probablysomethingelse.appspot.com",
    messagingSenderId: "numbers"
});

```

This allows the crawler to write crawl data to your database. Run a database test to see if it is working:
```

crawlbug.databaseTest();

```
Then set paths for the crawl data (finished site data, sites to visit data) and start a crawl with ( a root url, whether you're crawling for only unique base URLs, whether you want to crawl relative links, maxUrlNumber)

```

exports.pathSet("sites", "sitesToVisit");

exports.spider("https://google.com", false, false);

```

Have fun!

Post an issue if you have problems.
