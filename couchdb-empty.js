#!/usr/bin/env node
/*
 * node.js script to delete all data from a CouchDB database
 * where »data« are those whose IDs do not begin with a »_«.
 *
 * requires node.js with nano
 *
 * Invoke as:
 * couchdb-empty.js database1 database2 …
 *
 * 2013 Sven-S. Porst <ssp-web@earthlingsoft.net>
 */

var couchURL = 'http://localhost:5984'

var arguments = process.argv.splice(2);
if (arguments.length >= 2) {
	if (arguments[0] === '-couchURL') {
		couchURL = arguments[1];
		arguments = arguments.splice(2);
	}
}

var couch = require('nano');

arguments.forEach(function(dbName, index, array) {
	var db = couch({'url':couchURL, 'db':dbName});
	db.list(function(err, body){
		if (!err) {
			console.log('Using CouchDB »' + dbName + '« at »' + couchURL + '«');
			var bulkDocs = [];
			body.rows.forEach(function(value, index){
				var id = value.id;
				if (id[0] != '_') {
					var rev = value.value.rev;
					bulkDocs.push({'_id': id, '_rev': rev, '_deleted': true});
				}
				else {
					console.log(dbName + ': Preserving »' + id + '«');
				}
			});
			console.log(dbName + ': Deleting ' + bulkDocs.length + ' documents');
			db.bulk({'docs':bulkDocs}, {}, function(err, body) {
				if (err) {
					console.log(dbName + ': bulk load problem: ' + err);
				}
			});
		}
		else {
			console.log(dbName + ': list problem: ' + err + body);
		}
	});
});

