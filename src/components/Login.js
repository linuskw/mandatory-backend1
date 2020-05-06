import React from 'react';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: "",
    }

    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);
  }

  change(e){
    this.setState({userName: e.target.value});
  }

  submit(e){
    e.preventDefault();
    if (this.state.userName.length > 0) {
      this.props.userNameSet(this.state.userName)
    }
  }

  render() {
    return(
      <>
        <form onSubmit={this.submit}>
          <label>Username:</label>
          <input type="text" value={this.state.userName} onChange={this.change}/>
          <input type="submit" value="Send"/>
        </form>
      </>
    )
  }
}

export default Login;
