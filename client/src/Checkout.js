import React from 'react'
import axios from 'axios';
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux';

const STRIPE_PUBLISHABLE = process.env.NODE_ENV === 'development'
  ? 'pk_test_x3cWWClZyuk8ijM99TYhgrOY'
  : 'pk_live_4HYjC6m0GJMujOiFf71IpuRO'

const PAYMENT_SERVER_URL = process.env.NODE_ENV === 'production'
  ? '/api/payAndSendTweet'
  : '/api/payAndSendTweet';

const fromEuroToCent = amount => amount * 100;
const CURRENCY = 'USD';

const Checkout = ({ name, description, amount, valuesDict, doneCallback, errorCallback}) => {
  const successPayment = data => {
    doneCallback();
  };

  const errorPayment = data => {
    alert('Payment Error - Sorry, I haven\'t implemented any error handling :-/');
    // errorCallback();
  };

  const onToken = (amount, description) => token => {
    const checkoutValues = {
      description,
      source: token.id,
      currency: CURRENCY,
      amount: fromEuroToCent(amount)
    }
    const data = Object.assign({}, valuesDict, checkoutValues);
    console.log('got these values in Checkout')
    console.log(valuesDict)

    return axios.post(PAYMENT_SERVER_URL, data)
      .then(successPayment)
      .catch(errorPayment);
  }

return <StripeCheckout
    name={name}
    description={description}
    amount={fromEuroToCent(amount)}
    token={onToken(amount, description)}
    currency={CURRENCY}
    stripeKey={STRIPE_PUBLISHABLE}
  />
}

export default Checkout;