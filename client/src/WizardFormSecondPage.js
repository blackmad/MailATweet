import React from 'react'
import { reduxForm } from 'redux-form'
import validate from './validate'
import { formValueSelector } from 'redux-form';  // ES6
import { connect } from 'react-redux'
import { extractTweetId } from './utils'
import TweetEmbed from 'react-tweet-embed'

const WizardFormSecondPage = props => {
  const { handleSubmit, previousPage, tweetUrlOrId } = props
  console.log(extractTweetId);
  const tweetId = extractTweetId(tweetUrlOrId);

  return (
    <form onSubmit={handleSubmit}>
      <TweetEmbed id={tweetId} />
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
    </form>
  )
}

const tmpForm = reduxForm({
  form: 'wizard', //Form name is same
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate
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