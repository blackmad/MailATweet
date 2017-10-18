import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WizardFormFirstPage from './WizardFormFirstPage'
import WizardFormSecondPage from './WizardFormSecondPage'
import WizardFormThirdPage from './WizardFormThirdPage'
import WizardFormFourthPage from './WizardFormFourthPage'
import AllDonePage from './AllDonePage'
import { extractTweetId } from './utils'

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
      needPostcardPreview: true,
      postcardPreview: null,
      postcardPreviewImagesDone: false,
      numPostcardPreviewTries: 0
    }
  }

  // I think this is why I should use redux and ... bleh
  fetchTweetPreview(values) {
    const url = '/api/previewTweet?id=' + extractTweetId(values.tweetUrlOrId)
    console.log(url)
    const that = this;
    fetch(url)
      .then(function(response) {
        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then(function(data) {
        console.log({tweetPreview: data})
        var toReturn = {fetchingTweetPreview: false, tweetPreview: data};
        if (that.state.values.address_line1) {
          console.log(data.id)
          toReturn = updateObject(toReturn, that.fetchPostcard({values: that.state.values, isTest: true, id: data.id}))
        }
        that.setState(toReturn);
      });
    return {fetchingTweetPreview: true, needPostcardPreview: true}
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

  render() {
    // const { onSubmit } = this.props
    const { page, done } = this.state;

    return (
      <div>
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
            previousPage={this.previousPage}
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