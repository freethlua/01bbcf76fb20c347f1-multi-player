import { Component, render } from 'preact';
import h from 'preact-hyperscript-h';
import YouTubeIframeLoader from 'youtube-iframe';
import VimeoPlayerAPI from '@vimeo/player';
import * as utils from './utils';

class App extends Component {

  componentWillMount() {
    console.log(`componentWillMount`);
    this.setState({
      playing: null,
    });
  }

  componentDidMount() {
    console.log(`componentDidMount`);
    for (const player in utils.matchers) {
      this[player + 'PlayerInit']();
    }
  }

  getPlayerElement(label) {
    return document.getElementById(label + '-player-element');
  }

  youtubePlayerInit() {
    const playerElement = this.getPlayerElement('youtube');
    YouTubeIframeLoader.load(YT => {
      this.youtubePlayerAPI = new YT.Player(playerElement);
      this.youtubePlayerAPI.addEventListener('onStateChange', e => e.data === 0 && this.youtubePlayerOnEnd(e));
      console.log('Youtube player initialized');
    });
    playerElement.style.display = 'none';
    console.log('Youtube player initialized');
  }

  vimeoPlayerInit() {
    const playerElement = this.getPlayerElement('vimeo');
    this.vimeoPlayerAPI = new VimeoPlayerAPI(playerElement, { id: 59777392 });
    this.vimeoPlayerAPI.on('ended', e => this.vimeoPlayerOnEnd(e));
    playerElement.style.display = 'none';
    console.log('Vimeo player initialized');
  }

  dailymotionPlayerInit() {
    const playerElement = this.getPlayerElement('dailymotion');
    this.dailymotionPlayerAPI = DM.player(playerElement, {
      // video: 'xwr14q',
    });
    this.dailymotionPlayerAPI.addEventListener('video_end', e => this.dailymotionPlayerOnEnd(e));
    this.dailymotionPlayerAPI.addEventListener('apiready', e => this.dailymotionPlayerOnReady(e));
    playerElement.style.display = 'none';
    console.log('Dailymotion player initialized');
  }

  componentWillUpdate() {
    console.log('componentWillUpdate');
  }

  playerOnEnd(player) {
    const element = this.getPlayerElement(player);
    element.style.display = 'none';
    this.setState({ playing: false });
    this.playNext();
  }

  youtubePlayerOnEnd(e) {
    this.playerOnEnd('youtube');
  }

  vimeoPlayerOnEnd(e) {
    this.playerOnEnd('vimeo');
  }

  dailymotionPlayerOnEnd(e) {
    this.playerOnEnd('dailymotion');
  }
  dailymotionPlayerOnReady(e) {
    const playerElement = this.getPlayerElement('dailymotion');
    playerElement.style.display = 'none';
  }

  playNext() {
    if (!this.state.currentUrl) {
      throw new Error('Need a state.currentUrl');
    }
    if (!this.state.urls || !this.state.urls.length) {
      throw new Error('Need a state.urls');
    }
    let currentPlayingCaptured = false;
    let nextQueued = false;
    for (let i = 0; i < this.state.urls.length; i++) {
      if (this.state.urls[i] === this.state.currentUrl) {
        const url = this.state.urls[i + 1]
        if (url) {
          const potentialCurrentUrl = utils.processUrl(url);
          if (!potentialCurrentUrl) {
            this.setState({ error: 'Malformed URL: ' + url });
          } else {
            this.setState({ currentUrl: url });
            this[potentialCurrentUrl.player + 'PlayerPlayVideo'](potentialCurrentUrl.url);
          }
        } else {
          this.setState({
            currentUrl: null,
            status: 'Playlist ended',
          });
        }
        break;
      }
    }
  }

  play() {
    this.setState({ error: null });
    if (this.state.playing) {

    } else {
      if (this.state.currentUrl) {

      } else {
        if (this.state.urls && this.state.urls.length) {
          const url = this.state.urls[0];
          const potentialCurrentUrl = utils.processUrl(url);
          if (!potentialCurrentUrl) {
            this.setState({ error: 'Malformed URL: ' + url });
          } else {
            this.setState({ currentUrl: url });
            this[potentialCurrentUrl.player + 'PlayerPlayVideo'](potentialCurrentUrl.url);
          }
        } else {
          this.setState({ error: 'No URLs to play' });
        }
      }
    }
  }

  youtubePlayerPlayVideo(videoId) {
    this.youtubePlayerAPI.loadVideoById(videoId);
    this.setState({
      playing: true,
      status: 'Playing: ' + videoId
    });
    const playerElement = this.getPlayerElement('youtube');
    playerElement.style.display = 'block';
  }

  vimeoPlayerPlayVideo(videoId) {
    this.vimeoPlayerAPI.loadVideo(videoId).then(() => {
      this.vimeoPlayerAPI.play();
      this.setState({
        playing: true,
        status: 'Playing: ' + videoId
      });
      const playerElement = this.getPlayerElement('vimeo');
      playerElement.style.display = 'block';
    });
  }

  dailymotionPlayerPlayVideo(videoId) {
    this.dailymotionPlayerAPI.load(videoId);
    this.dailymotionPlayerAPI.play();
    this.setState({
      playing: true,
      status: 'Playing: ' + videoId
    });
    const playerElement = this.getPlayerElement('dailymotion');
    playerElement.style.display = 'block';
  }

  render() {
    return h.div([
      h.form({ onsubmit: e => this.play() }, [
        h.textarea({
          placeholder: 'Enter URLs here',
          oninput: e => this.setState({
            error: null,
            urls: e.target.value
              .split(/[\n\r ]+/g)
              .filter(Boolean)
              .map(_ => _.trim())
          }),
          style: {
            display: 'block',
            width: '100%',
            height: '10em',
          }
        }),
        h.button('Play'),
      ]),
      h.pre(JSON.stringify(this.state.urls, null, 2)),
      this.state.error && h.pre('Error: ' + this.state.error),
      this.state.status && h.pre('Status: ' + this.state.status),
    ]);
  }
}

render(h(App), document.getElementById('app'));
document.body.addEventListener('submit', e => e.target.nodeName === 'FORM' && e.preventDefault(), true);
