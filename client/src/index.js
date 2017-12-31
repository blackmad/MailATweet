import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { reducer as reduxFormReducer } from 'redux-form'
import WizardForm from './WizardForm'
import './redux-form.css'
import './index.css';
import './narrow-jumbotron.css';

const reducer = combineReducers({
  form: reduxFormReducer // mounted under "form"
})
const store = (window.devToolsExtension
  ? window.devToolsExtension()(createStore)
  : createStore)(reducer)

const showResults = values =>
  new Promise(resolve => {
    setTimeout(() => {
      // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
      resolve()
    }, 500)
  })

class App extends Component {
  render() {
    return (

 <div className="container">
      <div className="header clearfix">

        <h3 className="text-muted"><a className="nounderline" href="/">Mail-A-Tweet</a></h3>
      </div>

      <div className="jumbotron">
        <Provider store={store}>
        <div className="App">
          <WizardForm onSubmit={showResults} />
        </div>
      </Provider>
      </div>

      <div className="footer clearfix">
          <div className="postcard-icon"></div>
          <div className="clearfix">
            <div className="float-right">
              <div className="text-left">
                Love,<br/>
                <a href="https://twitter.com/blackmad" className="nounderline">@blackmad</a>
              </div>
            </div>
          </div>
          <div className="ps-disclaimer text-justify">
              <strong>P.S.</strong> <a href="/about.html">More about this project</a>
          </div>
        </div>
      </div>


    );
  }
}

const dest = document.getElementById('root')
ReactDOM.render(<App />, dest)