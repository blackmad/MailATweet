import React from 'react'

 class RetryingImage extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        src: this.props.src,
        title: this.props.title,
        loading: true,
        display: 'none'
      };
      this.onError=this.onError.bind(this);
    }

    onError(){
      setTimeout(() => {
        const src = this.props.src;
        this.setState({src: src + "&nonce=" + new Date().getUTCSeconds()});
      }, 1000);
     };

    onLoad() {
      this.setState({
        loading: false,
        display: 'initial'
      });
      // this should really update the global state, bleh
    }

    render(){
      return (
        <div>
          <h3>{this.state.title}</h3>
          { this.state.loading && <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>}
          <img onLoad={this.onLoad.bind(this)} style={{display:this.state.display}} onError={this.onError} src={this.state.src}/>
        </div>
      )
    }
  }

  export default RetryingImage;