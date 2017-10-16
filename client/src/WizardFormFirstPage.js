import React from 'react'
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form'
import { renderField } from './renderField'
import { extractTweetId } from './utils.js'

const required = value => (value ? undefined : 'Required')
const mustBeTweet = value => value && extractTweetId(value) === null ? "Invalid input" : undefined

let WizardFormFirstPage = props => {
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

WizardFormFirstPage = reduxForm({
  form: 'wizard', // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize : true // this is needed!!
})(WizardFormFirstPage)

if (process.env.NODE_ENV == 'development') {
  WizardFormFirstPage = connect(
    state => ({
      initialValues:  {
        tweetUrlOrId: 'https://twitter.com/Bodegacats_/status/914092267983589376'
      }
    })
  )(WizardFormFirstPage);
}

export default WizardFormFirstPage