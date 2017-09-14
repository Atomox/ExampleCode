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


const Item = (props) => {
  const itemClassName = (status) => {
    switch (status) {
      case 'major':
        return 'fa fa-plus-square-o';
      case 'done':
        return 'fa fa-check';
      case 'migrated':
        return 'fa fa-angle-right';
      case 'scheduled':
        return 'fa fa-angle-left';

      default:
        return 'fa fa-minus-square-o';
    }
  }
  return (
    <div className="item">
      <i className={itemClassName(props.type)}>{props.label}</i>
    </div>
  );
}

const BulletList = (props) =>  {
  return (
    <div className="List">
      <h3>{props.title}</h3>
      <div className="">
        {props.items.map(items => <Item {...items} />)}
      </div>
      <Form addItem={props.addItem} lid={props.id} />
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
        <select value={ this.state.type }
          onChange={ this.handleChange }
          name="type" required>
          <option value="normal">Normal</option>
          <option value="major">Major</option>
          <option value="migrated">Migrated</option>
          <option value="done">Done</option>
          <option value="scheduled">Scheduled</option> 
        </select>
        <input type="text"
          name="label"
          value={ this.state.label }
          onChange={ this.handleChange }
          placeholder="Task"
          required />
        <button type="submit">Add</button>
      </form>
    );
  }
}


class App extends React.Component {

  state = {
    lists: [
      { id: 1,
        title: 'Lake Destiny',
        items: [
          { label: "get keys",
            type: 'minor'
          },
          { label: "get soup",
            type: 'minor'
          },
          { label: "heat soup",
            type: 'minor'
          },
          { label: "bond with Max",
            type: 'major'
          },
        ],
      },
      { id: 2,
        title: 'Powerline Concert',
        items: [
          { label: "Give Max a choice",
            type: 'minor'
          },
          { label: "get mad",
            type: 'minor'
          },
          { label: "Car Rolls Away",
            type: 'minor'
          },
          { label: "bond with Max",
            type: 'major'
          },
        ],
      },
    ]
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
        {this.state.lists.map(lists => <BulletList {...lists} addItem={this.addNewItem} />)}
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
