import { extractTweetId } from './utils.js'

const validate = values => {
  const errors = {}
  if (!values.tweetUrlOrId) {
    errors.tweetUrlOrId = 'Required'
  } else if (extractTweetId(values.tweetUrlOrId) === null) {
    errors.tweetUrlOrId = 'Must enter tweet Url or ID'
  }

  return errors
}

export default validate