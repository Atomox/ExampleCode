let React = require('react');

// Components
let Form = require('./form');

// Helpers
let types = require('./types');

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

  state = { label: this.props.label };

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


module.exports = {
  BulletList,
  Item,
  itemClassName
}