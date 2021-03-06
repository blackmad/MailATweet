import React from 'react'
import { reduxForm } from 'redux-form'
import { formValueSelector } from 'redux-form';  // ES6
import { connect } from 'react-redux'
import { extractIdFromUrlOrId } from './utils'

const WizardFormSecondPage = props => {
  const { handleSubmit, previousPage, tweetUrlOrId } = props
  const socialId = extractIdFromUrlOrId(tweetUrlOrId);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2>Is this the tweet you were thinking of?</h2>
      </div>
      <div>
        <button type="button" className="previous" onClick={previousPage}>
          No
        </button>
        <button type="submit" className="next">
          Yes!
        </button>
      </div>
      {socialId.renderPreview()}
    </form>
  )
}

const tmpForm = reduxForm({
  form: 'wizard', //Form name is same
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true // <------ unregister fields on unmount
})(WizardFormSecondPage)

const selector = formValueSelector('wizard')

const tmpForm2 = connect(state => {
  // can select values individually
  const tweetUrlOrId = selector(state, 'tweetUrlOrId')
  return {
    tweetUrlOrId
  }
})(tmpForm)

export default tmpForm2