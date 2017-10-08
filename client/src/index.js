import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { reducer as reduxFormReducer } from 'redux-form'
import WizardForm from './WizardForm'
import './redux-form.css'
import './index.scss';

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
      <Provider store={store}>
        <div className="App">
          <h2>Form (in index.js)</h2>

          <WizardForm onSubmit={showResults} />
        </div>
      </Provider>
    );
  }
}

const dest = document.getElementById('root')
ReactDOM.render(<App />, dest)