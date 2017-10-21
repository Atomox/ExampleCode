// Bullet List React Man.
//
// v1
// x. List displaying items and icons for status/type
// x. Multiple lists
// x. Add items to lists
// x. Update status of list items.
// x. Toggle complete status.
// 6. Delete item option.  
// 7. Store lists in backend.
//
//
// v2
// 1. Multiple layout types (Day vs 7 days vs month)
// 2. Change themes
let React = require('react')
import ReactDOM from 'react-dom'

const types = {
  normal: { name: 'normal', class: 'fa fa-dot-circle-o', doneClass: 'fa fa-circle'  },
  major: { name: 'major', class: 'fa fa-circle-o', doneClass: 'fa fa-dot-circle-o'  },
  migrated: { name: 'migrated', class: 'fa fa-angle-right', doneClass: 'fa fa-angle-left'  },
  scheduled: { name: 'scheduled', class: 'fa fa-angle-left', doneClass: 'fa fa-angle-right' }
};

const itemClassName = (status, done) => {
  if (!types[status]) { status = 'normal'; }
  return (done)
    ? types[status].doneClass
    : types[status].class;
}


/**
 * A list item.
 *
 * Can update the status or label.
 */
class Item extends React.Component {

  this.state = { label: this.props.label };

  toggleDone = () => {
    let myProps = JSON.parse(JSON.stringify(this.props));
    myProps.done = !this.props.done;
    this.props.handleEdit(myProps, false, true);
  }

  handleClick = () => {
    this.props.handleEdit(this.props, true);
  }

  handleChange = (event) => {
    this.setState({label: event.target.value});
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSubmit(event);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let myProps = JSON.parse(JSON.stringify(this.props));
    myProps.label = this.state.label;
    this.props.handleEdit(myProps, false, true);
  }

  componentDidUpdate() { }

  render() {

    let isEdit = (this.props.edit && this.props.edit === true);

    let label = (isEdit)
      ? <input type="text" className="edit"
          autoFocus
          value={this.state.label}
          onChange={this.handleChange}
          onBlur={this.handleSubmit} 
          onKeyPress={this.handleKeyPress} />
      : this.props.label;

    return (<div className={ (this.props.done ) ? 'item done' : 'item' }>
      <i className={itemClassName(this.props.type,this.props.done)}
        onClick={this.toggleDone}></i>
      <span onDoubleClick={this.handleClick}>
        { label }
      </span>
    </div>);
  }
}


/**
 * A list of items,
 * plus the ability to add to the list.
 */
const BulletList = (props) =>  {
  return (
    <div className="List">
      <h3>{props.title}</h3>
      <Form addItem={props.addItem} lid={props.id} types={props.types}/>
      <div className="">
        {props.items.map(items =>
          <Item {...items}
            handleEdit={props.editItem}
             lid={props.id}
            />)}
      </div>
    </div>
  );
}


/**
 * A form to edit a parent list.
 */
class Form extends React.Component {
  static initialState = (props) => ({
    label: '',
    type: '',
    lid: props.lid,
  });

  state = Form.initialState(this.props);

  handleChange = (event) => {
    switch (event.target.name) {
      case 'type':
        this.setState({ type: event.target.value })
        break;
      case 'label':
        this.setState({ label: event.target.value })
        break;
    }
  };

  /* Add an item on submit. */
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.addItem(this.state);
    this.setState(Form.initialState(this.props));
  };

  render() {
    return (
      /* Allow user to add an item to the list. */
      <form onSubmit={ this.handleSubmit }>
        <input type="text"
          name="label"
          value={ this.state.label }
          onChange={ this.handleChange }
          placeholder="Task"
          required />
          <select value={ this.state.type }
          onChange={ this.handleChange }
          name="type" required>
          { Object.keys(this.props.types).map((key, i) => {
              return <SelectOption {...this.props.types[key]} /> }
          )}
        </select>
      </form>
    );
  }
}


/**
 * A select option
 */
const SelectOption = (props) => {
  return (
    <option value={props.name}>
      <i className={props.class}>{props.name}</i>
    </option>
  );
}


/**
 * The main app container.
 */
class App extends React.Component {

  state = {
    lists: [
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
    ]
  }

  editItem = (data, toggleOn, update) => {
    this.setState(prevState => {
      let myList = prevState.lists.findIndex((obj => obj.id == data.lid));
      let myNewState = prevState;

      if (prevState.lists[myList]) {
         myNewState.lists[myList].items = prevState.lists[myList].items.map(function(obj) {
          obj.edit = (obj.id === data.id && toggleOn === true) ? true : false;
          if (obj.id === data.id && update === true) {
            obj.id = data.id;
            obj.label = data.label;
            obj.type = data.type;
            obj.done = data.done;
          }
          return obj;
        });
      }
      
      return {
        lists: myNewState.lists
      };
    });
  }

  addNewItem = (data) => {

    this.setState(prevState => {
      var lid = prevState.lists.findIndex((obj => obj.id == data.lid));
      if (lid >= 0) {
        let deepState = Object.assign({}, this.state);
        let nextId = (this.state.lists[lid].nextItemId)
          ? this.state.lists[lid].nextItemId : 1;
        deepState.lists[lid].items = prevState.lists[lid].items.concat({
            label: data.label,
            type: data.type,
            id: nextId,
            done: false,
        });
        
        /* Increment counter */
        deepState.lists[lid].nextItemId = nextId+1;

        return {
          lists: deepState.lists
        };
      }
    });
  }

  render() {
    return (
      <div>
        {this.state.lists.map(lists =>
            <BulletList {...lists} types={types}
              addItem={this.addNewItem}
              editItem={this.editItem} />
          )
        }
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
