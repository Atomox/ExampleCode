// Bullet List React Man.
//
// v1
// x. List displaying items and icons for status/type
// x. Multiple lists
// x. Add items to lists
// 4. Update status of list items.
// 5. Store lists in backend.
//
//
// v2
// 1. Multiple layout types (Day vs 7 days vs month)
// 2. Change themes

import ReactDOM from 'react-dom'

const types = {
  major: { name: 'major', class: 'fa fa-plus-square-o' },
  done: { name: 'done', class: 'fa fa-check' },
  migrated: { name: 'migrated', class: 'fa fa-angle-right' },
  scheduled: { name: 'scheduled', class: 'fa fa-angle-left' },
  normal: { name: 'normal', class: 'fa fa-minus-square-o' }
};

const itemClassName = (status) => {
  return (types[status])
  	? types[status].class
  	: types.normal.class;
}

class Item extends React.Component {

  state = { label: this.props.label };

  handleClick = () => {
    this.props.handleEdit(this.props, true);
    console.log('submit');
  }

  handleChange = (event) => {
    this.setState({label: event.target.value});
  }

  handleSubmit = (event) => {
  	event.preventDefault();
    console.log(this.state);
    this.props.handleEdit(this.props, false);
  }

  componentDidUpdate() { }

  render() {
    if (this.props.edit && this.props.edit === true) {
      return (
        <i className={itemClassName(this.props.type)}>
        <input type="text" className="edit"
        	autoFocus
        	value={this.state.label}
          onChange={handleChange}
          onBlur={this.handleSubmit}/></i>
      );
    }

    return (
      <div className="item">
        <i className={itemClassName(this.props.type)}
          onDoubleClick={this.handleClick}>{this.props.label}</i>
      </div>
    );
  }
}

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
        <button type="submit">Add</button>
      </form>
    );
  }
}

const SelectOption = (props) => {
  return (
    <option value={props.name}>
      <i className={props.class}>{props.name}</i>
    </option>
  );
}


class App extends React.Component {

  state = {
    lists: [
      { id: 1,
        title: 'Lake Destiny',
        items: [
          { label: "get keys",
            type: 'minor',
            id: 1
          },
          { label: "get soup",
            type: 'minor',
            id: 2
          },
          { label: "heat soup",
            type: 'minor',
            id: 3
          },
          { label: "bond with Max",
            type: 'major',
            id: 4
          },
        ],
      },
      { id: 2,
        title: 'Powerline Concert',
        items: [
          { label: "Give Max a choice",
            type: 'minor',
            id: 1
          },
          { label: "get mad",
            type: 'minor',
            id: 2
          },
          { label: "Car Rolls Away",
            type: 'minor',
            id: 3
          },
          { label: "bond with Max",
            type: 'major',
            id: 4
          },
        ],
      },
    ]
  }

  editItem = (data, toggleOn) => {
    this.setState(prevState => {
      let myList = prevState.lists.findIndex((obj => obj.id == data.lid));
      let myNewState = prevState;

      if (prevState.lists[myList]) {
         myNewState.lists[myList].items = prevState.lists[myList].items.map(function(obj) {
          obj.edit = (obj.id === data.id && toggleOn === true) ? true : false;
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
        deepState.lists[lid].items = prevState.lists[lid].items.concat({
            label: data.label,
            type: data.type
        });

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
