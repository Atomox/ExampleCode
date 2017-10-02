# Node.js Notes:

# V8

- The default VM for runing node, but not the only option. `Chakra` (Microsoft Edge) is another alternative.
- Javascript features in node are just all JS features supported by V8.
- 3 types of features:
  - Shipping (enabled by default)
  - Staged (use: `--harmony` to enable these)
  - In Progress
  - Enable any of these with flags
- When running the node command, us flags to enable specific features, such as "always use strict mode"
  - node --use_strict=true
- V8 Module
  - Use the V8 module to allow a settings file for Node V8 runtime settings.

- Node uses `libuv` to wait for async events.
  - This is a C library used to abstract non-blocking i/o operations.
  - Uses a thread pool to handle async processes.
  - *Libuv is where the `event loop` lives*.
- When node is ready to handle callback functions, it passes control into the V8 engine.
  - Control is returned to Node once the callback is complete.
  - V8 runs using a SINGLE THREAD
  - This means that when Node passes callbacks to V8, Node cannot process any more code, since V8 is single threaded.

## repl
- Stands for: Read Execute Print Loop.

## Global Object

### Process Object.
  - Bridge between the application and it's running environment.

```
process.versions
```
Will show us versions of the current node and it's dependencies.
- Use `process.versions.v8` to get the current version of v8 we are running on.
  - Use this to run extra code accounting for version descrepencies.

```
process.on('exit', (code) => {
    // Inform someone our process is ending.
});

process.on('uncaughtException', (err) => {
    // Do something, then exit anyway.

    process.exit(1);
});
```

## The Event Loop
 - The entity that handles external events and converts them into callback invocations.

1. Is the Event Queue Empty?
  - No? Pop an item from the queue into the call stack.
  - Yes?
2. Is the Call Stack Empty?
  - No? Let it continue.
  - Yes? Go to 1.
3. If both the queue and the stack are empty, exit.

- *Slow code on the Call Stack will block the Event Loop.*
- We can also overload the Event Queue, keeping the event loop busy.


### `setTimeout` vs `setImmediate` vs `process.nextTick`

- `SetTimeout` and `setImmediate` both pull the callback off the stack.
  - `SetTimeout` loads it back onto the queue, once it has completed.
  - `SetImmediate` runs in a separate phase of the eventLoop, and should get executed on the next tick of the event loop.
  - `process.nextTick` will get *executed at the end of the current tick*, __before__ the next tick of the event loop.

When making an async function, make sure youre error handling also works async:

Sync error but async without:
```
function fileSize(filename, cb) {
  if (typeof fileName !== 'string') {
    // Run the callback right away. Blocking.
    return cb(new TypeError('Some error'))
  }
  sf.stat(fileName, (err, stats) => {
    if (err) {
      return cb(err);
    }
    cb(null, stats.size());
  });
}
```

Async error *_AND_* async without:
```
function fileSize(filename, cb) {
  if (typeof fileName !== 'string') {
    // Register this callback to run in the next tick, so it remains non-blocking.
    return process.nextTick(
      cb,
      new TypeError('Some error'),
    );
  }
  sf.stat(fileName, (err, stats) => {
    if (err) {
      return cb(err);
    }
    cb(null, stats.size());
  });
}
```

## `promise/then` vs `async/await`

### Async/await
```
async function countOdd() {
  try {
    const lines = await readFileAsArray('./numbers');
    const numbers = lines.map(Number);
    const oddCount = numbers.filter(number => number % 2 === 1).length()
    console.log('odd numbers count:', oddCount);
  }
  catch (err) {
    // handle error
  }
}
```
### Promise
```
const readFileAsArray = function(file) {
  return new Promise((resolve,reject) => {
    fs.readFile(file, function(err, data) {
        if (err) {
          // Error
        }

        const lines = data.toString()().trim().split('\n');
        resolve(lines);
    });
  });
}
```

## `let` vs `var`

- Let is block scope.
- Var is function scope.

### let

- You can only declare a variable with let once per block scope. So, within the same block of scope, once you declare `let foo`, you cannot declare it again without an error.

```

```

### const

- While const itself can't be changed, the properties inside a const object *can be changed*.

```
  const food = {
    type: 'pizza',
    calories: 250
  }

  // Totally valid
  food.style = deep dish
  food.calories = 50000
```

- Want to make it immutable? Use `Object.freeze(food);`
