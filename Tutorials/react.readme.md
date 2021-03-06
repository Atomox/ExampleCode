# React.js Development

## Getting Started

### A Note on Syntax:
This tutorial will mostly use **ES6 syntax**. We're compiling it down before sending it to the browser. **Babel** + **Webpack**, if you must know. But that's for later. Just know that this won't work out-of-the-box on all browsers.

## Components

A small class or function which can accept props (parameters), hold a state (it's own internal variables), and return a rendered chunk of HTML.


### Smart vs dumb

- *Smart components* have their own state, and children.
- *Dumb components* have no state, and are static. You can pass props to them to update them, but this is the only way they will change.

#### Similarities
- CamelCase Name, with first letter capitalized.
- Can be passed Props (passed parameters).
- Return rendered JSX/HTML.
- *Returned JSX/HTML MUST be a SINGLE ELEMENT.*
  - If you have a list of things, make sure it's wrapped in an outer element, like a `<div>` or `<ul>`.

#### Smart Components
- A smart Component is a React class.
- `render()` function is a must, and returns the final JSX/HTML of an element.
- Can have a state, as well as props (passed parameters).
  - State maintains itself (memory + self management).
- Better about refreshing child components.
- It's more expensive.

```
class SmartGuy extends React.Component {
  constructor(props) {
    super(props);
    // Constructor, because we're a class.

    // Initialize a state.
    this.state = {
      some_var: true,
    }
  }

  render() {
    return (
      <div className="some-div">      { /* Always wrap the return in a SINGLE parent element. */ }
        <h1>I'm JSX (HTML)</h1>
        { /* Javascript goes inside parenthesis. */ }
      </div>
    );
  }
}
```


#### Dumb Components
- Dumb components have less overhead.
- Their children might not rerender with a change, so consider if this is a leaf component, or a parent component. If a parent, consider a class.

```
const dumbProp = (props) =>  {
  return (
    <div className="dumb-one">
      <h3>{props.title}</h3>
      <div className="">
        Some stuff in here.
      </div>
    </div>
  );
}
```

### Call Components
Call them from another component:
```
// Render our components.
class App extends React.Component {
  render() {

    // Remember, we need a single wrapping div element.
    return (
          <div>

            <div className="cell">
              <Header
                title={this.state.title}
                subtitle={this.state.subtitle}
                messages={this.state.messages} />

              A component with passed props.
              <SomeComponent
                someProp={this.state.foo}
                thatBar={this.state.bar}
                bazProp="baz" />

              No Props on this guy:
              <AnotherComponent />
            </div>
    );
  }
}
```


## React Router
```

# In your React App:

render() {
  return (
    <Router>
      <div>
        <h1>You can still have static stuff</h1>

        This always gets rendered:
        <Header title={this.state.title} />

      { /**
        To send props to Routed Components, we have to use this gross syntax:
        component={() => { return <Component> } }
       */}
        <Route exact path='/' component={() => <MyComponent
          list={this.state.list}
          portfolio={this.state.portfolio}
          historical={this.state.historical}
          settings={this.state.settings}
          updateCurrency={this.setCurrency} />} />

        {/* Prop-less Components use this Route syntax: */}
        <Route path='/about' component=<CookiePage/> />
        <Route path='/about' component=<PizzaPage/> />
        <Route path='/about' component=<BahnMiPage/> />

      </div>
    </Router>
  );
}
```


## Call your App:
This is your index.js file. Include this in your root public folder's index.html:
```
<!DOCTYPE html>
<html leng="en">
  <body>
    <!-- Your App Targets this Div -->
    <div id="app"></div>

    <!-- The magic happens with this line: -->
    <script type="text/javascript" src="index.js"></script>
  </body>
</html>
```

```
### index.js

let React = require('react');
let ReactDOM = require('react-dom');

// Components
let App = require('./components/App');


# A: Without Router:
ReactDOM.render((<App />),
  document.getElementById('app')
);


# B: With Router:
let BrowserRouter = require('react-router-dom').BrowserRouter;
ReactDOM.render(
  (
  <BrowserRouter>
    <App />
  </BrowserRouter>
  ),
  document.getElementById('app')
);
```

### HTML and JSX
JSX is basically HTML, with a few changes. It allows us to have the markup/template
alongside the component data. Goes against everything we've been told, but it works. However, since JSX compiles down to JS, there are a few changes.

#### `class` -> `className`
`<div class="hiDad">` becomes `<div className="hiDad">`.

#### `for -> forHTML`

These two changes occur because Javascript already uses these keywords.

#### Simple HTML and components
You can render normal HTML tags, as well as smart JSX Components, so:
```
  <div><h2>This is valid</h2></div>
  <PizzaComponent myvar={ 'so is this' }/>
```
The top element gets left alone. The bottom one gets evaluated. It's also a JS variable name, meaning:
```
let PizzaComponent = () => {
  return (
    <h3>I AM THE GREAT PIZZA!</h3>
  );
}
```


### Props vs State -- (Ways to store data for components)
All components can be passed data, using props.

#### Props
Like passing parameters to a function. Always from outside the Component.

```
### Passing to a Component
<SomeComponent
  someProp={this.state.foo}
  thatBar={this.state.bar}
  bazProp="baz" />

  <SomeSmartComponent
    someProp={this.state.foo}
    thatBar={this.state.bar}
    bazProp="baz" />

# Dumb Component
let SomeComponent = (props) => {
  return (
    <div>
      Foo: {props.someProp}
      Bar: {props.thatBar}
    </div>
    );
}

# Smart Component
class SomeSmartComponent extends React.Component {
  render() {
    return (
      <div>
        Foo: {this.props.someProp}
        Bar: {this.props.thatBar}
      </div>
      );
  }
}
```

### Handling State
Only Smart Components can use a state. Managing it is more complicated, too.

```
# Smart Component
class SomeSmartComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      someProp: 'foo',
      thatBar: 'bar',
      whichBaz: 'update me!',
    };
  }

  // We're using componentDidMount(), a provided hook, which fires AFTER
  // the component has successfully been added to React.
  componentDidMount() {
    // Always use setState() to update the state.
    // In here, you merge the old state with the one you want, and return it.
    this.setState(prevState => {
      prevState.whichBar = 'Now I am Baz';
      return prevState;
    });
  }

  render() {
    return (
      <div>
        Foo: {this.state.someProp}
      </div>
      );
  }
}
```

Notice we reference the state with `this.state.somevalue`. This is the state object. The Component is called "smart", because it maintains it's own memory of the state. It can update it itself. You could even pass in Props, and initialize the state with the values of those props. But the emphasis is on **you**. You manage the state yourself.

We also set a new state value using the `setState()` function, which provided the most recent state object as a parameter, which you then update to match what you want, and return the new version of. **Don't update the state directly.** This exists to resolve any "merge conflicts." Use this so that if everyone wants to update at once, they have to get in line. Next customer, please.



# Redux

## Actions
rateCourse( rating ) {
  return {type: RATE_COURSE, rating: rating };
}
`type` is required, and generally matches the function name. Any other key/value pairs are optional. Just make sure they are valid JSON, so no functions, plz.

## Redux Store
Stores the data. Does not manipulate it.

- store.dispatch(action)
- store.subscribe(listener)
- store.getState()
- replaceReducer(nextReducer)

## Immutability
```
Object.assign(target, ...sources);

// Create a new Object, and merge the following params into it.
Object.assign({}, state, {role: 'admin'});
```

** Babel can't transpile. Make sure to use babel-polyfill!**

### ES6 vs ES5 alternatives to Object.assign && Spread operator
Lodash merge
Lodash extend
npm Object-assign
react-addons-update
Immutable.js

- Javascript's primitives, like String, int, boolean are already immutable.

#### Dev Module for Immutable Error Checking:
redux-immutable-state-invariant
- Throws errors when mutation is attempted.

## Reducers
```
function myReducer(state, action) {
  // return new state based on the action.
}
```

```
### NO!
function myReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT_COUNTER':
      state.counter++;
      return state;
  }
}

### YES!
function myReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT_COUNTER':
      return (Object.assign({
          {},       // Empty object
          state,    // old state
          {counter: state.counter + 1}  // Updated state variable WITHOUT editing state.
        }));
  }
}
```

Reducers should update the value based ONLY on what value came in.
- Do not make API calls.
- Do not run math.random() or Date.now().
- Do not call functions that mutate the data.

When the store is called, **all reducers are called**. If you are not changing anythign in the reducer, **return the unchanged state**.



## Setup React + Router + Redux

### index.js
```
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import App from './components/app';

import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  ,
  document.getElementById('app')
);
```


### Actions
For a given action, pass the data.
```
export function updateMyThing(value) {
  return {type: 'updateMyThing', thing: value};
}
```

### Reducers
#### Single reducer
You'll have many of these. This takes the state and your value to update in the state. You put your value into a new copy of the state, and return that.
Don't update the old state. Make a new copy. This is for efficiency reasons, among other things.
```
const initialState = {
    foo: 'bar'
};

export default function thingReducer(state = initialState, action) {
  switch (action.type) {
    case 'updateMyThing':
      let newState = Object.assign({}, state, {
          ...state,
          thing: action.thing
      });
      return newState;
    default:
      return state;
  }
}
```
#### Root Reducer
This combines all the reducers. You'll generally have one of these.
```
import {combineReducers} from 'redux';
import thing from './thingReducer'; // Your reducer above.

const rootReducer = combineReducers({
  thing: thing,
});

export default rootReducer;
```

### ConfigStore
```
export default function configureStore(initialState) {
  return createStore(
    rootReducer,  // Your root reducer, above.
    initialState,

    // (optional) Add plugins.
    applyMiddleware(reduxImmutableStateInvariant())
  );
}
```

### App Page Component
Here are some of the basic elements in your main component, and how React plugs into them.
```
App extends React Component {
constructor(props,context) {
  super(props, context);
  this.state = {};

  // Solve the this problem in JS, binding the Component context inside
  // an action function. These functions are the ones called onClick(), or some other DOM event. They will call your React actions.
  this.onSomeAction = this.onSomeAction.bind(this);
}

onSomeAction = () => {
  // Call your react action here, passing the state on your component.
  this.props.actions.updateThing(this.state.thing);
}

render() {}

App.propTypes = {
  someProp: PropTypes.object.isRequired
};

// Redux Function & Connect
function  mapStateToProps(state, ownProps) {
  return {
    // Now someProp (in our component) maps from React's state.someProp
    // Result? this.props.someProp is now available in your component,
    // with the contents of React's state.someProp.
    someProp: state.someProp
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // This takes all your actions, and maps them to this.props.action.*
    // Then you can call them inside your app via:
    // this.props.action.updateThing()
    actions: bindActionCreators(thingActions,dispatch)
  };
}

// Connect to react, provide functions for mapping local state to props
export default connect(mapStateToProps,mapDispatchToProps)(App);
```
