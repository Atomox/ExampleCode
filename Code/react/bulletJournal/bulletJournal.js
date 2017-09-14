// Bullet List React Man.
//
// v1
// 1. List displaying items and icons for status/type
// 2. Multiple lists
// 3. Add items to lists
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
  state = {
    label: '',
    type: '',
  }
  render() {

    console.log(this.props);
    console.log(this.state);
    
    return (

      /* How do we know which item this is? */
      <form onSubmit={this.props.addItem}>
        <input type="text"
          value={this.state.lists[this.props.id].form_state.type}
          placeholder="Type"
          required />
        <input type="text"
/*          value={this.state.lists[this.props.id].form_state.label} */
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
        form_state: null,
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
        form_state: null,
        title: 'Powerline Concert',
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
    ]
  }

  addNewItem = (event) => {
    event.preventDefault();

    // , listId, itemInfo

    this.setState(prevState => {
      var lid = prevState.lists.findIndex((obj => obj.id == listId));
      if (lid) {
        console.log('Adding item to list at index: ', lid,'...', itemInfo);
      	return {
          //
          // @TODO
          //
          // lists[lid].items: prevState.lists[lid].items.concat(itemInfo),
        };
      }
      else {
        console.warn('Could not find the list ID:', listId, ', in: ', prevState.lists);
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
