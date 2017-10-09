import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { renderField } from './renderField'
import { extractTweetId } from './utils.js'

const required = value => (value ? undefined : 'Required')
const mustBeTweet = value => value && extractTweetId(value) === null ? "Invalid input" : undefined

const WizardFormFirstPage = props => {
  const { handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="tweetUrlOrId"
        type="text"
        component={renderField}
        label="Tweet URL or ID"
        validate={[required, mustBeTweet]}
      />
      <div>
        <button type="submit" className="next">
          Next
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'wizard', // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true // <------ unregister fields on unmount
})(WizardFormFirstPage)