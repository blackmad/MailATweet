import React from 'react'
import TweetEmbed from 'react-tweet-embed'
import InstagramEmbed from 'react-instagram-embed'

class TwitterId {
  constructor(id) {
    this.id = id
  }

  renderPreview() {
    return <TweetEmbed id={this.id} />
  }

  getNamespace() {
    return 'twitter'
  }

  getId() {
    return this.id;
  }

  getUrl() {
    return `https://twitter.com/blackmad/status/${this.id}`;
  }
}

class InstagramId {
  constructor(id) {
    this.id = id
  }

  getUrl() {
    return `https://www.instagram.com/p/${this.id}/`
  }

  renderPreview() {
    return <InstagramEmbed
      url={this.getUrl()}
      maxWidth={320}
      hideCaption={false}
      containerTagName='div'
      protocol=''
      onLoading={() => {}}
      onSuccess={() => {}}
      onAfterRender={() => {}}
      onFailure={() => {}}
    />
  }

  getNamespace() {
    return 'instagram'
  }

  getId() {
    return this.id;
  }
}

export function extractIdFromUrlOrId(string) {
  if (string === null) { return null; }
  if (string.match(/^[0-9]+$/)) { return new TwitterId(string); }

  var twitterTestUrl = string.match(/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?(?:mobile\.)?twitter\.com\/\w+\/status\/(\d+)(?:\?.*)?$/i);
  if (twitterTestUrl) { return new TwitterId(twitterTestUrl[2]); }

  var instaTestUrl = string.match(/insta.*\/p\/([A-Za-z0-9\-_]+)\/(?:\?.*)$/i);
  if (instaTestUrl) { return new InstagramId(instaTestUrl[1]); }

  instaTestUrl = string.match(/insta.*\/p\/([A-Za-z0-9\-_]+)\/$/i);
  if (instaTestUrl) { return new InstagramId(instaTestUrl[1]); }

  return null;
}