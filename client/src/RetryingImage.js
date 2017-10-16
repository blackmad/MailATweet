import React from 'react'

 class RetryingImage extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        src: this.props.src,
        title: this.props.title,
        loading: true
      };
      this.onError=this.onError.bind(this);
    }

    onError(){
      console.log("error: could not find picture");
      setTimeout(() => {
        console.log("retrying image")
        const src = this.props.src;
        this.setState({src: src + "&nonce=" + new Date().getUTCSeconds()});
      }, 1000);
     };

    onLoad() {
      console.log("success, picture loaded");
      this.setState({loading: false});
      // this should really update the global state, bleh
    }

    render(){
      return (
        <div>
          <h3>{this.state.title}</h3>
          { this.state.loading && <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>}
          <img onLoad={this.onLoad.bind(this)} onError={this.onError} src={this.state.src}/>
        </div>
      )
    }
  }

  export default RetryingImage;