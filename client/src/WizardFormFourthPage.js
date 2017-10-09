import React from 'react'
import { reduxForm } from 'redux-form'
import StripeCheckout from 'react-stripe-checkout';
import Checkout from './Checkout.js'

 class RetryingImage extends React.Component{
    constructor(props){
      super(props);
      this.state={src: this.props.src};
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

    render(){
      return <img onError={this.onError} src={this.state.src}/>;
    }
  }

const WizardFormFourthPage = props => {
  const { handleSubmit, previousPage, postcardPreview, postcardPreviewImagesDone } = props

  if (!postcardPreview) {
    return (
      <div className="alert alert-info">
        <strong>Waiting for postcard preview</strong><br/>
        <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>
        <span className="sr-only">Loading Preview...</span>
      </div>
    )
  }

  // if (!postcardPreviewImagesDone) {
  //   return (
  //     <div className="alert alert-info">
  //       <strong>Waiting for previews to show up on s3</strong><br/>
  //       <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>
  //       <span className="sr-only">Waiting ...</span>
  //     </div>
  //   )
  // }

  if (postcardPreview._response && postcardPreview._response.body && postcardPreview._response.body.error) {
    return (
      <div className="alert alert-danger">
        <strong>Oh no, error!</strong> {postcardPreview.error.message}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2>Postcard Preview (will take a second to load)</h2>
        <h3>Front</h3>
        <RetryingImage src={postcardPreview.thumbnails[0].medium}/>
        <h3>Back</h3>
        <RetryingImage src={postcardPreview.thumbnails[1].medium}/>
      </div>
      <h2>If it all looks good, then ... </h2>
      <Checkout
        name={'Pay for and send this postcard!'}
        description={'Lob charges $0.70 to send postcards. $1 is a round number.'}
        amount={1}
      />
    </form>
  )
}

export default reduxForm({
  form: 'wizard', // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true // <------ unregister fields on unmount
})(WizardFormFourthPage)