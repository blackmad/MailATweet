import React from 'react'

export default props => {
  const { postcardPreview } = props

  return (
    <div>
      <div>
        <h1>Thanks!</h1>
        <h3>Your postcard should arrive at its destination in a week or two</h3>
        <img alt="postcard preview" src={postcardPreview.thumbnails[0].medium}/>
      </div>
      <div>
        <a className="twitter-share-button"
          href="https://twitter.com/home?status=I%20just%20turned%20a%20tweet%20into%20a%20postcard&url=http://mailatweet.blackmad.com">
          Tweet about Mail-A-Tweet</a>
      </div>
    </div>
  )
}