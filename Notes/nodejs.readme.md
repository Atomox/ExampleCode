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

### Flow of the Loop
1. Is the Event Queue Empty?
  a. No? Pop an item from the queue into the call stack.
  b. Yes?
2. Is the Call Stack Empty?
  a. No? Let it continue.
  b. Yes? Go to 1.
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


# Javascript

## Concepts

### Hoisting
```
bob = 2;
var bob;
```
In JS, you can assign a variable _before_ it's declairation, because the compiler will move all declarations to the top of their scope.

### Strict Mode
```
'use strict';
```
- Prevent auto-variable declaration. If JS doesn't find a variable, within the scopes, it creates a new one at the highest level, global, scope.

### IIFE
```
(function hiDad () {
  let foo = bar;
  echo foo;
})();
```
This code is contained, including it's scope, and runs 
- Stand for Immediately Invoked Function Expressions
- Contains scope within the IFFE.

### Closures
```
function makeAdder(x) {
  function add(y) {
    return x + y;
  }
}

let plusOne = makeAdder(1);
let plusTen = makeAdder(10);

console.log(plusOne(21)); // Prints 22.
console.log(plusTen(21)); // Prints 31.
```
- Functions remember where they were declaired, _not_ where they were run. So, they maintain the scope of their origin, not their location during execution.


### This
What `this` points to depends upon how the surrounding function was called.

Consider:
```
function foo() {
  console.log(this.bar);
}

let bar = 'global';
let obj1 = {
  bar: "obj1",
  foo: foo
}
let obj2 = {
  bar: "obj2"
}
```

Then, here are the 4 ways this is declared:
```
foo();           // "global"
```
1. `this` refers to the global object.
```
obj1.foo();      // "obj1"
```
2. obj1.foo() sets this to obj1's object.
```
foo.call(obj2);  // "obj2"
```
3. foo.call(obj2) calls foo with obj2 asigned to `this`.
```
new foo();       // undefined
```
4. Creates a new, empty object, which `this` refers to.



## `let` vs `var`

- Let is block scope.
- Var is function scope.

### let

- No more hoisting.
  - You cannot assign to a variable before you declair it.
- You can only declare a variable with let once per block scope. So, within the same block of scope, once you declare `let foo`, you cannot declare it again without an error.


```

```

### const

- While const itself can't be changed, the properties inside a const object *can be changed*.
- Const _must be_ initialized when daclared.

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


## Block Scoping

```
let myVar = 12;
{
  let myVar = 23;
}
console.log(myVar);  // outputs 12.
```


Closure state problems with var:
```
let myFunctions = [];
for (var i = 0; i < 2; i++) {
  myFunctions.push(function () { return i; });
}
console.log(myFunctions[0]()); // Outputs 2, because the entire closure gets a single state.
```
-with let-
```
let myFunctions = [];
for (let i = 0; i < 2; i++) {
  myFunctions.push(function () { return i; });
}
console.log(myFunctions[0]()); // Outputs 0, because the each iteration has it's own closure state.
```
With block scope, closures now work as we would expect, because each iteration is a block, and so block scope gives use 2 states, 1 for i=0, and 1 for i=1. 


## Arrow Functions

```
  let cups_of_sugar = destination => {
    (destination == 'moon') ? return 3.5 : 1;
  };
  console.log(hi_dad());  // Outputs "soup"
```

```
  let hi_dad = () => 'soup';
  console.log(hi_dad());  // Outputs "soup"
```

- This allows us to drop off "function" and "return".

The above is equivalent to:
```
  let hi_dad = function () {
    return 'soup';
  }
  console.log(hi_dad());  // Outputs "soup"
```