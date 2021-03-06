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
  * No? Pop an item from the queue into the call stack.
  * Yes?
2. Is the Call Stack Empty?
  * No? Let it continue.
  * Yes? Go to 1.
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
- Disables some dangerous methods:

#### with()

```
with (someObject) {
  a = b+c   // like someObject.a = someObject.b + someObject.c.
}
```
This is disabled in strict mode, because the compiler disables several optomizations when with is used, because it changes lexical scope at run-time.

#### eval() && setTimeout "some expression"

- **setTimeout "expression" is disabled** in strict mode, because the compiler disables several optomizations when with is used, because it changes lexical scope at run-time.
- **eval()** gets it's own scope, and **cannot affect external scope.**

#### this

From MSDN:
"That means ... that in browsers it's no longer possible to reference the window object through this inside a strict mode function."

#### New reserve words:

From MSDN:
"First, in strict mode a short list of identifiers become reserved keywords. These words are implements, interface, let, package, private, protected, public, static, and yield. In strict mode, then, you can't name or use variables or arguments with these names."


### IIFE
```
// Starting with ( before function makes it a function expression, which 
(function hiDad () {
  let foo = bar;
  echo foo;
})();
```
This code is contained, including it's scope, and runs 
- Stand for Immediately Invoked Function Expressions
- Contains scope within the IFFE.
- This is because normal ES5 is functional scope.


### Closures
Closure is when a function remembers it's lexicl scope even when the function is executed outside that lexical scope.

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

Closures remember their original scope, even when setTimeout is running a callback somewhere else (setTimeout is running somewher else)
```
// Prints i: 6 (6 times)
// Because the scope is the entire function.
for (var i=1; i <=5; i++) {
    setTimeout(function(){
      console.log("i: " + i);
    }, i*1000);
}

// Prints 1 2 3 4 5
// Because the scope is the IFFE, so not the entire loop. 
for (var i=1; i <=5; i++) {
    (function(i) {
      setTimeout(function(){
        console.log("i: " + i);
      }, i*1000);
    })(i);
}
```

- Functions remember where they were declaired, _not_ where they were run. So, they maintain the scope of their origin, not their location during execution.
- Closure is just a pointer to the lexical origin scope.


### Classic Module Pattern

Maintain a set of functions, and an internal state. Make only some members public. Without using a class.

```
var foo = (function(){

  var o = { bar: "bar" };

  return {
    bar: function(){
      // some code
    }
  }
});

foo.bar();
```
1. Outter wrapping function call.
2. At least one inner function that returns out, keeping a closuree over the internal state.


### ES6 Module Pattern

Assume an entire file, like headers in c++:
foo.js:
```
var o = { bar: "bar" };

export function bar() {
  return o.bar;
}
```
- This is file-based

```
// Load just a piece like this:
import bar from "foo";
bar();  // "bar"

// Load the entire module:
module foo from "foo";
foo.bar();
```



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

#### 4 ways `this` is declared:

1. normal behavior: function call()
```
foo();           // "global"
```
- `this` refers to the global object, or `undefined` if in 'strict mode'.


2. object.function()
```
obj1.foo();      // "obj1"
```

- obj1.foo() sets this to obj1's object.

3. function.call() or function.apply()
```
foo.call(obj2);   // "obj2"
foo.apply(obj2);  // "obj2"
```

- foo.call(obj2) (or .apply()) calls foo with obj2 asigned to `this`.

4. the `new` keyword
```
new foo();       // undefined
```

- Creates a new, empty object, which `this` refers to. 
#### `this` Order of Precidence:
`new` takes precidences over everything else, **hard binding included.**

1. new
2. Call, apply, bind (or hard binding)
3. Called on object.
4. a. Global object
   b. undefined in stract mode.


#### Promises vs Callback and `this`

- If you pass a callback that uses `this`, keep in mind that the `this` could revert to another method of `this`, depending upon how the callback is invoked.


## new keyword

When you use `new`, 4 things happen:

1. A brand new object is created.
2. *Object gets linked to a different object.*
3. The new object is bound to `this` for the function call.
4. If there is no return from the function, `this` will be returned.


## `Catch` has Block Scope
- In native ES5, the Catch part of the try/catch block was implemented as block scope.
- This was before the block scope craze of ES6's let, () => {}, etc.


## `let` vs `var`

- Let is block scope.
- Var is function scope.

### let

- No more hoisting.
  - You cannot assign to a variable before you declair it.
- You can only declare a variable with let once per block scope. So, within the same block of scope, once you declare `let foo`, you cannot declare it again without an error.
- Block scope works inside loops, inside if statements, almost anything with a pair of `{` `}` curly braces.
  - This means scope earlier garbage collection, and performance gains!


```
function foo() {
  var bar = 'hi';
  for (var i = 0; i < 2; i++) {      // var i vs let i.
    //some code
  }
  console.log(i);   // with var i, we get "2". With let i, we get ReferenceError. 
}
```
Above, using let would assign `i` to the scope of the loop. Using var would hoist `i` to the scope of foo().

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

From MSDN: 
"Two factors influenced the introduction of arrow functions: shorter functions and non-binding of this."

- Used for functional expression replacement. Anonymous functions.
- Since they are anonymous functions, they cannot self reference.
  - Bad for cases such as recursion.
  - Bad for debugging call stack traces.

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

### Arrow Functions change this scope
```
var invoice = {
  number: 123,
  process: function () {
    console.log(this);
  }
}
invoice.process();   // outputs: invoice{ number:123}
```

```
var invoice = {
  number: 123,
  process: () => console.log(this);
}
invoice.process();   // outputs: Window { ... }
```
- *You cannot .bind() or .call() a new `this` to an arrow function.*


## Rest and Spread Operators

### `function someFunct(...variable)` Rest Operator
Gather up all remaining parameters passed, and load them into the variable array.


### `callFunction(...someArray)` Spread Operator
Take an array of values, and explode them into multiple variables/parameters.
- You can do this on function calls or array calls:
```
// On a function
var prices = [12,20,18];
var maxPrice = Math.max(...prices);
console.log(maxPrice); // 20

// On an array
var prices = [12, 20, 18];
var newPriceArray = [...prices];
console.log(newPriceArray);  // [12, 20, 18]

// On a string
var myStr = "HiDad";
console.log([...myStr]);  // ['H', 'i', 'D', 'a', 'd']
```


## `for ... of`
- Works on iterables online, including arrays and strings.

## Destructuring Arrays & Objects
```
let a = [10, 25, 50];
let b = {a: 23, b: 25, c: 28};

let [ten, twentyfive, fifty] = a;
let {b1, b2, b3} = b;
```
Rappidly assign variables from an array or object to multiple variables.


# Scope in JS

## Ways to create new scope

1. Function
2. catch block
3. let + `{}` curley braces

### Block Scope vs Functional Scope

- Traditional Javascript is functional scope, except `catch`.
- Functional scope hoists var and function declariations up to the top of the scope.
- Block scope stops at the block level.
  - Variables don't live as long, so they can be garbage collected earlier.
  - with `let`, they only exist from where they are declared until the end of the block.


## Undeclared vs Undefined
- Undeclared: Reference Error. Variable was never set.
- Undefined: Variable was declared, but never given a value. 
  - Note: `null` is an object, while `undefined` is it's own type.