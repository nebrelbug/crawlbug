# Crawlbug
[![Build Status](https://travis-ci.org/nebrelbug/crawlbug.svg?branch=master)](https://travis-ci.org/nebrelbug/crawlbug)
[![dependencies Status](https://david-dm.org/nebrelbug/crawlbug/status.svg)](https://david-dm.org/nebrelbug/crawlbug)
[![npm version](https://img.shields.io/npm/v/crawlbug.svg)](https://www.npmjs.com/package/crawlbug)
[![npm downloads](https://img.shields.io/npm/dt/crawlbug.svg)](https://www.npmjs.com/package/crawlbug)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/y/nebrelbug/crawlbug.svg)](https://github.com/nebrelbug/crawlbug)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/33bf9811125c493f9808050e2499c9c6)](https://www.codacy.com/app/nebrelbug/crawlbug?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=nebrelbug/crawlbug&amp;utm_campaign=Badge_Grade)

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
