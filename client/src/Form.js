import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { reducer as reduxFormReducer } from 'redux-form'


const dest = document.getElementById('content')
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

let render = () => {
  const SimpleForm = require('./SimpleForm').default
  const raw = require('!!raw-loader!./SimpleForm')
  ReactDOM.render(
    <Provider store={store}>
      // <App
      //   /**
      //    * This <App/> component only provides the site wrapper.
      //    * Remove it on your dev server if you wish. It will not affect the functionality.
      //    */
      //   version="7.0.4"
      //   path="/examples/simple"
      //   breadcrumbs={generateExampleBreadcrumbs(
      //     'simple',
      //     'Simple Form Example',
      //     '7.0.4'
      //   )}
      // >
        // <Markdown content={readme} />

        <div style={{ textAlign: 'center' }}>
          <a
            href="https://codesandbox.io/s/mZRjw05yp"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '1.5em' }}
          >
            <i className="fa fa-codepen" /> Open in Sandbox
          </a>
        </div>

        <h2>Form</h2>

        <SimpleForm onSubmit={showResults} />

        <Values form="simple" />

        <h2>Code</h2>

        <h4>SimpleForm.js</h4>

        <Code source={raw} />
      </App>
    </Provider>,
    dest
  )
}

if (module.hot) {
  // Support hot reloading of components
  // and display an overlay for runtime errors
  const renderApp = render
  const renderError = error => {
    const RedBox = require('redbox-react')
    ReactDOM.render(<RedBox error={error} className="redbox" />, dest)
  }
  render = () => {
    try {
      renderApp()
    } catch (error) {
      renderError(error)
    }
  }
  const rerender = () => {
    setTimeout(render)
  }
  module.hot.accept('./SimpleForm', rerender)
  module.hot.accept('./Simple.md', rerender)
  module.hot.accept('!!raw-loader!./SimpleForm', rerender)
}

render()