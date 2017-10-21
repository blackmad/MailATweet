import React from 'react'
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form'
import { renderField } from './renderField'
import { extractTweetId } from './utils.js'

import splashImage from'./splashImage.png';

const required = value => (value ? undefined : 'Required')
const mustBeTweet = value => value && extractTweetId(value) === null ? "Invalid input" : undefined
const isInteger = value =>
  value && !/^[0-9]+$/i.test(value)
    ? 'Invalid number'
    : undefined

let WizardFormFirstPage = props => {
  const { handleSubmit } = props

var splashStyleWrapper = {
  backgroundColor: '#52c4c5',
  padding: '1rem',
  marginBottom: '3rem',
  borderRadius: '8px'
}

var splashStyle = {
  backgroundColor: '#52c4c5',
  backgroundImage: `url(${splashImage})`,
  width: '100%',
  height: '14rem',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right'
};

var splashTextStyle = {
  color: 'white',
  fontSize: '5rem',
  lineHeight: '5rem',
  width: '60%',
  float: 'left',
  marginLeft: '1rem',
  marginTop: '1rem'
}

  return (
    <div>
      <div style={splashStyleWrapper}>
        <div style={splashTextStyle}>
          <span className="align-middle">
            1 Dollar =
          </span>
        </div>
        <div style={splashStyle}>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Field
          name="tweetUrlOrId"
          type="text"
          component={renderField}
          label="Tweet URL or ID"
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