var express = require('express');
var app = express();
var server = require('http').createServer(app);

/**
app.use(express.static(__dirname + '/includes'));
*/

let lists = [
      { id: 1,
        title: 'Lake Destiny',
        items: [
          { label: "get keys",
            type: 'minor',
            id: 1,
            done: false,
          },
          { label: "get soup",
            type: 'minor',
            id: 2,
            done: false,
          },
          { label: "heat soup",
            type: 'minor',
            id: 3,
            done: false,
          },
          { label: "bond with Max",
            type: 'major',
            id: 4,
            done: false,
          },
        ],
        nextItemId: 5,
      },
      { id: 2,
        title: 'Powerline Concert',
        items: [
          { label: "Give Max a choice",
            type: 'minor',
            id: 1,
            done: false,
          },
          { label: "Get mad",
            type: 'minor',
            id: 2,
            done: false,
          },
          { label: "Car Rolls Away",
            type: 'scheduled',
            id: 3,
            done: false,
          },
          { label: "Bond with Max",
            type: 'migrated',
            id: 4,
            done: false,
          },
        ],
        nextItemId: 5,
      },
      { id: 3,
        title: 'None Yet',
        items: [ ],
        nextItemId: 0,
      },
    ];

app.get('/list/:id', function(req, resp, next) {
  console.log('List time!');
  let payload = false;

  if (req.params.id) {
    let reqId = lists.findIndex((obj => obj.id == req.params.id));

  	if (reqId >= 0) {
    	payload = lists[reqId];
  	}
  }
  
  resp.json(payload);
});
app.get('/lists', function(req, resp, next) {
  console.log('List time!');
  resp.json(lists);
});

server.listen('8383');
