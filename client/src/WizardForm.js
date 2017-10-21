import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WizardFormFirstPage from './WizardFormFirstPage'
import WizardFormSecondPage from './WizardFormSecondPage'
import WizardFormThirdPage from './WizardFormThirdPage'
import WizardFormFourthPage from './WizardFormFourthPage'
import AllDonePage from './AllDonePage'
import { extractTweetId } from './utils'
import ReactGA from './ReactGA'

function updateObject(oldObject, newValues) {
    // Encapsulate the idea of passing a new object as the first parameter
    // to Object.assign to ensure we correctly copy data instead of mutating
    return Object.assign({}, oldObject, newValues);
}


class WizardForm extends Component {
  constructor(props) {
    super(props)
    this.nextPage = this.nextPage.bind(this)
    this.previousPage = this.previousPage.bind(this)
    this.state = {
      page: 1,
      postcardPreview: null,
      postcardPreviewImagesDone: false,
      numPostcardPreviewTries: 0
    }
  }

  // I think this is why I should use redux and ... bleh
  fetchTweetPreview(values) {
    const url = `/api/previewTweet?id=${extractTweetId(values.tweetUrlOrId)}&maxPreviousTweets=${values.maxPreviousTweets}`
    console.log(url)
    const that = this;
    fetch(url)
      .then(function(response) {
        if (response.status >= 400) {
          ReactGA.exception({
            description: 'Bad response from previewTweet'
          });
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then(function(data) {
        console.log({tweetPreview: data})
        if (data.error) {
          ReactGA.exception({description: data.error.message, fatal: true });
          that.setState({fatalError: data.error.message, page: -1})
        } else {
          var toReturn = {fetchingTweetPreview: false, tweetPreview: data};
          if (that.state.values.address_line1) {
            console.log(data.id)
            toReturn = updateObject(toReturn, that.fetchPostcard({values: that.state.values, isTest: true, id: data.id}))
          }
          that.setState(toReturn);
        }
      });
    return {fetchingTweetPreview: true}
  }

  // // I'm sorry for using "that", I promise to fix
  fetchPostcard({values, isTest, id}) {
    const params = updateObject(values, {test: isTest, id: id})
    const esc = encodeURIComponent
    const query = Object.keys(params)
               .map(k => esc(k) + '=' + esc(params[k]))
               .join('&')

    const url = '/api/sendTweet?' + query;
    const that = this;
    console.log(url)
    fetch(url)
      .then(function(response) {
        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then(function(data) {
        console.log({postcardPreview: data})
        console.log('updating postcard preview state')
        that.setState(updateObject(that.state, {values: values, fetchingPostcardPreview: false, postcardPreview: data}))
      });
    return {fetchingPostcardPreview: true}
  }

  nextPage(values) {
    var newState = this.state;

    if (values.tweetUrlOrId && !this.state.fetchingTweetPreview) {
      newState = updateObject(newState, this.fetchTweetPreview(values))
    } else if (values.address_line1 && !this.state.fetchingTweetPreview) {
      console.log('kicking off preview fetch')
      newState = updateObject(newState, this.fetchPostcard({isTest: true, id: values.tweetPreview.id}))
    }

    newState.values = values;
    newState.page = this.state.page + 1;
    this.setState(newState)
  }

  previousPage() {
    this.setState({ page: this.state.page - 1 })
  }

  allDone() {
    this.setState({ done: true, page: -1 })
  }

  keepEditing() {
    this.setState({ postcardPreview: null, page: this.state.page - 1 })
  }

  render() {
    // const { onSubmit } = this.props
    const { page, done, fatalError } = this.state;

    if (page > 0) {
      ReactGA.event({
        category: 'Wizard',
        action: 'Reached Page',
        value: page
      });
    } else if (done) {
       ReactGA.event({
        category: 'Wizard',
        action: 'Sent Postcard'
      });
    }

    return (
      <div>
        {fatalError &&
           <div className="alert alert-danger">
           <h2>Sorry!</h2>
            There was a fatal error rendering the tweet. Please try again later. <p/>
            <strong>{fatalError}</strong>
          </div>
        }
        {page === 1 && <WizardFormFirstPage onSubmit={this.nextPage} />}
        {page === 2 &&
          <WizardFormSecondPage
            previousPage={this.previousPage}
            onSubmit={this.nextPage}
          />}
        {page === 3 &&
          <WizardFormThirdPage
            previousPage={this.previousPage}
            onSubmit={this.nextPage}
          />}
        {page === 4 && <WizardFormFourthPage
            previousPage={this.keepEditing.bind(this)}
            onSubmit={this.allDone.bind(this)}
            postcardPreview={this.state.postcardPreview}
            postcardPreviewImagesDone={this.state.postcardPreviewImagesDone}
            valuesDict={this.state.values}
            tweetPreview={this.state.tweetPreview}
          />}
        {done === true && <AllDonePage postcardPreview={this.state.postcardPreview}/>}
      </div>
    )
  }
}

WizardForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default WizardForm