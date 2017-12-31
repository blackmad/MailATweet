import React from 'react'
import { reduxForm } from 'redux-form'
import Checkout from './Checkout.js'
import RetryingImage from './RetryingImage.js'

const WizardFormFourthPage = props => {
  const { handleSubmit, valuesDict, previousPage, postcardPreview, postcardPreviewImagesDone, tweetPreview } = props

  if (!postcardPreview) {
    return (
      <div className="alert alert-info">
        <strong>Waiting for postcard preview</strong><br/>
        <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>
        <span className="sr-only">Loading Preview...</span>
      </div>
    )
  }

  if (postcardPreview._response && postcardPreview._response.body && postcardPreview._response.body.error) {
    return (
      <div>
        <div className="alert alert-danger">
          <strong>Oh no, error!</strong> {postcardPreview._response.body.error.message}
        </div>
        <form>
          <div>
            <button type="button" className="previous" onClick={previousPage}>
              Edit the postcard
            </button>
          </div>
        </form>
      </div>
    )
  }

  valuesDict['id'] = tweetPreview.id

  return (
    <div>
    <div>
        <h1>Postcard Preview</h1>
        <RetryingImage title="Front" src={postcardPreview.thumbnails[0].medium}/>
        <RetryingImage title="Back" src={postcardPreview.thumbnails[1].medium}/>
      </div>
      <div>
        <h2>If it all looks good, then ... </h2>
        <Checkout
          name={'Pay for and send this postcard!'}
          description={'Lob charges $0.70 to send postcards. $1 is a round number.'}
          amount={1}
          doneCallback={handleSubmit}
          valuesDict={valuesDict}
        />
      </div>
      <div>
        <h2>Otherwise ...</h2>
        <form>
          <div>
            <button type="button" className="previous" onClick={previousPage}>
              Keep editing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default reduxForm({
  form: 'wizard', // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true // <------ unregister fields on unmount
})(WizardFormFourthPage)