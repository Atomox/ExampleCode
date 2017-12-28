# React.js Development

## Getting Started

### A Note on Syntax:
This tutorial will mostly use **ES6 syntax**. We're compiling it down before sending it to the browser. **Babel** + **Webpack**, if you must know. But that's for later. Just know that this won't work out-of-the-box on all browsers.

## Components

A small class or function which can accept props (parameters), hold a state (it's own internal variables), and return a rendered chunk of HTML.

### Smart vs dumb

- *Smart components* have their own state, and children.
- *Dumb components* have no state, and are static. You can pass props to them to update them, but this is the only way they will change.

#### Smart Components
- A smart Component is a React class.
- CamelCase Name, with first letter capitalized.
- render() function is a must.
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
    { /** Always wrap the return in a SINGLE parent element. */ }
      <div className="some-div">
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
