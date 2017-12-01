import React from 'react'
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form'
import { renderField } from './renderField'
import { extractIdFromUrlOrId } from './utils.js'

import './index.css';

const required = value => (value ? undefined : 'Required')
const mustBeTweet = value => value && extractIdFromUrlOrId(value) === null ? "Invalid input" : undefined
const isInteger = value =>
  value && !/^[0-9]+$/i.test(value)
    ? 'Invalid number'
    : undefined

let WizardFormFirstPage = props => {
  const { handleSubmit } = props

  return (
    <div>
      <div className="splashWrapper">
        <div className="splashText">
          <span className="align-middle">
            1 Dollar =
          </span>
        </div>
        <div className="splash">
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Field
          name="tweetUrlOrId"
          type="text"
          component={renderField}
          label="Tweet or Instagram URL"
          validate={[required, mustBeTweet]}
        />
        <Field
          name="maxPreviousTweets"
          type="text"
          component={renderField}
          label="Max previous tweets (if reply)"
          validate={[isInteger]}
        />
        <div>
          <button type="submit" className="next">
            Next
          </button>
        </div>
      </form>
    </div>
  )
}

WizardFormFirstPage = reduxForm({
  form: 'wizard', // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize : true // this is needed!!
})(WizardFormFirstPage)

var initialValues = {
  maxPreviousTweets: 1
}

if (process.env.NODE_ENV === 'development') {
    initialValues['tweetUrlOrId'] = 'https://twitter.com/Bodegacats_/status/914092267983589376';
}

WizardFormFirstPage = connect(
  state => ({ initialValues })
)(WizardFormFirstPage);

export default WizardFormFirstPage