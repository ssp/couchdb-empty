#!/usr/bin/env node
/*
 * node.js script to delete all data from a CouchDB database
 * where »data« are those whose IDs do not begin with a »_«.
 *
 * requires node.js with nano
 *
 * Invoke like:
 * couchdb-empty.js database1 database2 …
 *
 * 2013 Sven-S. Porst <ssp-web@earthlingsoft.net>
 */
var couch = require('nano')('http://localhost:5984');

process.argv.forEach(function(value, index, array) {
	if (index > 1) {
		var db = couch.use(value);
		db.list(function(err, body){
			if (!err) {
				console.log('Deleting most records from »' + value + '«');
				var bulkDocs = [];
				body.rows.forEach(function(value, index){
					var id = value.id;
					if (id[0] != '_') {
						var rev = value.value.rev;
						bulkDocs.push({'_id': id, '_rev': rev, '_deleted': true});
					}
					else {
						console.log('Preserving »' + id + '«');
					}
				});
				db.bulk({'docs':bulkDocs}, {}, function(err, body) {
					console.log([err, body]);
				});
			}
			else {
				console.log(err);
			}
		});
	}
});

