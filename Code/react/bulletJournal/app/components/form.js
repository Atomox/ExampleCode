let React = require('react');


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


module.exports = Form;
